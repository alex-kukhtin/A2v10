// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.


using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
using System.Reflection;

using A2v10.Infrastructure;

/*
 * TODO: 
 * 3. Tree
 * 4. Groups
 * 5. Nested Object
 */

namespace A2v10.Data
{
    internal class DataModelReader
    {
        const String ROOT = "TRoot";
        const String SYSTEM_TYPE = "$System";
        const String ALIASES_TYPE = "$Aliases";

        IDataModel _dataModel;
        IdMapper _idMap = new IdMapper();
        RefMapper _refMap = new RefMapper();
        ExpandoObject _root = new ExpandoObject();
        ExpandoObject _sys = new ExpandoObject();

        ILocalizer _localizer;
        String _locale;

        public DataModelReader(ILocalizer localizer, String locale)
        {
            _localizer = localizer;
            _locale = locale;
        }

        public IDataModel DataModel
        {
            get
            {
                if (_dataModel != null)
                    return _dataModel;
                if (_groupMetadata != null)
                    _sys.Add("Levels", GroupMetadata.GetLevels(_groupMetadata));
                _dataModel = new DynamicDataModel(_metadata, _root, _sys);
                return _dataModel;
            }
        }

        public void SetParameters(SqlParameterCollection prms, Object values)
        {
            if (values == null)
                return;
            if (values is ExpandoObject)
            {
                foreach (var e in values as IDictionary<String, Object>)
                {
                    var val = e.Value;
                    if (val != null)
                        prms.AddWithValue("@" + e.Key, e.Value);
                }
            }
            else
            {
                var props = values.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);
                foreach (var prop in props)
                {
                    var val = prop.GetValue(values);
                    if (val != null)
                        prms.AddWithValue("@" + prop.Name, val);
                }
            }
        }

        void ProcessSystemRecord(IDataReader rdr)
        {
            // from !
            for (int i = 1; i < rdr.FieldCount; i++)
            {
                var fn = rdr.GetName(i);
                var dataVal = rdr.GetValue(i);
                if (fn == "!!PageSize")
                {
                    Int32 pageSize = (Int32)dataVal;
                    _sys.Add("PageSize", pageSize);
                }
                else if (fn == "!!ReadOnly")
                {
                    Boolean ro = false;
                    if (dataVal is Boolean)
                        ro = (Boolean)dataVal;
                    else if (dataVal is Int32)
                        ro = ((Int32)dataVal) != 0;
                    _sys.Add("ReadOnly", ro);
                }
                else
                {
                    _sys.Add(fn, dataVal);
                }
            }
        }

        public void ProcessOneRecord(IDataReader rdr)
        {
            var rootFI = new FieldInfo(GetAlias(rdr.GetName(0)));
            if (rootFI.TypeName == SYSTEM_TYPE)
            {
                ProcessSystemRecord(rdr);
                return;
            }
            else if (rootFI.TypeName == ALIASES_TYPE)
            {
                ProcessAliasesRecord(rdr);
                return;
            }
            var currentRecord = new ExpandoObject();
            bool bAdded = false;
            Object id = null;
            Int32 rowCount = 0;
            Boolean bHasRowCount = false;
            List<Boolean> groupKeys = null;
            // from 1!
            for (int i = 1; i < rdr.FieldCount; i++) {
                var dataVal = rdr.GetValue(i);
                if (dataVal == DBNull.Value)
                    dataVal = null;
                var fn = GetAlias(rdr.GetName(i));
                FieldInfo fi = new FieldInfo(fn);
                if (fi.IsGroupMarker)
                {
                    if (groupKeys == null)
                        groupKeys = new List<Boolean>();
                    Boolean bVal = (dataVal != null) ? (dataVal.ToString() == "1") : false;
                    groupKeys.Add(bVal);
                    continue;
                }
                AddValueToRecord(currentRecord, fi, dataVal);
                if (fi.IsRowCount) {
                    if (dataVal is Int32)
                        rowCount = (Int32)dataVal;
                    else
                        throw new DataLoaderException("Invalid field type for !!RowCount");
                    bHasRowCount = true;
                }
                if (fi.IsId)
                {
                    if (fi.IsComplexField)
                        _idMap.Add(fi.TypeName, dataVal, currentRecord);
                    else
                    {
                        _idMap.Add(rootFI.TypeName, dataVal, currentRecord);
                        id = dataVal;
                    }
                }
                if (fi.IsParentId)
                {
                    if (rootFI.IsArray)
                    {
                        AddRecordToArray(fi.TypeName, dataVal, currentRecord);
                        if (!rootFI.IsVisible)
                            bAdded = true;
                    }
                    else if (rootFI.IsTree)
                    {
                        if (dataVal == null)
                            _root.AddToArray(rootFI.PropertyName, currentRecord);
                        else
                            AddRecordToArray(fi.TypeName, dataVal, currentRecord);
                        bAdded = true;

                    }
                    else if (rootFI.IsObject)
                    {
                        // nested object
                        AddRecordToRecord(fi.TypeName, dataVal, currentRecord);
                        if (!rootFI.IsVisible)
                            bAdded = true;
                    }
                }
            }
            if (!bAdded)
            {
                if (rootFI.IsGroup)
                    AddRecordToGroup(currentRecord, rootFI, groupKeys);
                else
                    AddRecordToModel(currentRecord, rootFI, id);
            }
            else
                CheckRecordRef(currentRecord, rootFI, id);
            if (bHasRowCount)
            {
                AddRowCount(rootFI.PropertyName, rowCount);
            }
        }

        void AddRowCount(String propertyName, Int32 rowCount)
        {
            var pn = $"{propertyName}.$RowCount";
            // added in metadata
            // _root.AddChecked(pn, rowCount);
            _root.Set(pn, rowCount);
        }

        void AddRecordToRecord(String propName, Object id, ExpandoObject currentRecord)
        {
            var pxa = propName.Split('.'); // <Type>.PropName
            if (pxa.Length != 2)
                throw new DataLoaderException($"Invalid field name '{propName}' for array. 'TypeName.PropertyName' expected");
            /*0-key, 1-Property*/
            var key = Tuple.Create(pxa[0], id);
            ExpandoObject mapObj = null;
            if (!_idMap.TryGetValue(key, out mapObj))
                throw new DataLoaderException($"Property '{propName}'. Object {pxa[0]} (Id={id}) not found in map");
            mapObj.Set(pxa[1], currentRecord);
        }

        void AddRecordToArray(String propName, Object id, ExpandoObject currentRecord)
        {
            var pxa = propName.Split('.'); // <Type>.PropName
            if (pxa.Length != 2)
                throw new DataLoaderException($"Invalid field name '{propName}' for array. 'TypeName.PropertyName' expected");
            /*0-key, 1-Property*/
            var key = Tuple.Create(pxa[0], id);
            ExpandoObject mapObj = null;
            if (!_idMap.TryGetValue(key, out mapObj))
                throw new DataLoaderException($"Property '{propName}'. Object {pxa[0]} (Id={id}) not found in map");
            mapObj.AddToArray(pxa[1], currentRecord);
        }

        void AddValueToRecord(IDictionary<String, Object> record, FieldInfo field, Object value)
        {
            if (!field.IsVisible)
                return;
            if (field.IsArray)
                record.Add(field.PropertyName, new List<ExpandoObject>());
            else if (field.IsComplexField)
            {
                var propNames = field.PropertyName.Split('.');
                if (propNames.Length != 2)
                    throw new DataLoaderException($"Invalid complex name {field.PropertyName}");
                var innerObj = record.GetOrCreate(propNames[0]);
                innerObj.Add(propNames[1], value);
            }
            else if (field.IsRefId)
            {
                var refValue = new ExpandoObject();
                _refMap.Add(field.TypeName, value, refValue);
                record.Add(field.PropertyName, refValue);
            }
            else if (value is String)
                record.Add(field.PropertyName, _localizer.Localize(_locale, value.ToString()));
            else
                record.Add(field.PropertyName, value);
        }

        void CheckRecordRef(ExpandoObject currentRecord, FieldInfo field, Object id)
        {
            if (field.IsArray || field.IsMap)
                _refMap.MergeObject(field.TypeName, id, currentRecord);
        }


        void AddRecordToGroup(ExpandoObject currentRecord, FieldInfo field, List<Boolean> groupKeys)
        {
            if (groupKeys == null)
                throw new DataLoaderException($"There is no groups property for '{field.TypeName}");
            ElementMetadata elemMeta = GetOrCreateMetadata(field.TypeName);
            if (String.IsNullOrEmpty(elemMeta.Items))
                throw new DataLoaderException($"There is no 'Items' property for '{field.TypeName}");
            GroupMetadata groupMeta = GetOrCreateGroupMetadata(field.TypeName);
            if (groupMeta.IsRoot(groupKeys))
            {
                _root.Add(field.PropertyName, currentRecord);
                groupMeta.CacheElement(groupMeta.RootKey, currentRecord); // current
            }
            else
            {
                // item1 - elemKey, item2 -> parentKey
                var keys = groupMeta.GetKeys(groupKeys, currentRecord);
                var parentRec = groupMeta.GetCachedElement(keys.Item2); // parent
                parentRec.AddToArray(elemMeta.Items, currentRecord);
                if (!groupMeta.IsLeaf(groupKeys))
                    groupMeta.CacheElement(keys.Item1, currentRecord); // current
            }
        }

        void AddRecordToModel(ExpandoObject currentRecord, FieldInfo field, Object id)
        {
            if (field.IsArray)
            {
                _refMap.MergeObject(field.TypeName, id, currentRecord);
                _root.AddToArray(field.PropertyName, currentRecord);
            }
            else if (field.IsTree)
                _root.AddToArray(field.PropertyName, currentRecord);
            else if (field.IsObject)
                _root.Add(field.PropertyName, currentRecord);
            else if (field.IsMap)
                _refMap.MergeObject(field.TypeName, id, currentRecord);
        }


        void ProcessComplexMetadata(FieldInfo fieldInfo, ElementMetadata elem, DataType dt)
        {
            // create metadata for nested type
            var innerElem = GetOrCreateMetadata(fieldInfo.TypeName);
            var fna = fieldInfo.PropertyName.Split('.');
            if (fna.Length != 2)
                throw new DataLoaderException($"Invalid complex name {fieldInfo.PropertyName}");
            elem.AddField(new FieldInfo($"{fna[0]}!{fieldInfo.TypeName}"), DataType.Undefined);
            innerElem.AddField(new FieldInfo(fieldInfo, fna[1]), dt);
        }

        Dictionary<String, String> _aliases;

        void ProcessAliasesMetadata(IDataReader rdr)
        {
            _aliases = new Dictionary<String, String>();
            // 1-based
            for (int i = 1; i < rdr.FieldCount; i++)
            {
                _aliases.Add(rdr.GetName(i), null);
            }
        }

        String GetAlias(String name)
        {
            if (_aliases == null)
                return name;
            String outName;
            if (_aliases.TryGetValue(name, out outName))
                return outName;
            return name;
        }

        void ProcessAliasesRecord(IDataReader rdr)
        {
            if (_aliases == null)
                throw new InvalidOperationException();
            // 1-based
            for (int i = 1; i < rdr.FieldCount; i++)
            {
                String name = rdr.GetName(i);
                if (_aliases.ContainsKey(name))
                {
                    _aliases[name] = rdr.GetString(i);
                }
            }
        }

        public void ProcessMetadataAliases(IDataReader rdr)
        {
            if (rdr.FieldCount == 0)
                return;
            var objectDef = new FieldInfo(GetAlias(rdr.GetName(0)));
            if (objectDef.TypeName == ALIASES_TYPE)
                ProcessAliasesMetadata(rdr);
        }

        public void ProcessOneMetadata(IDataReader rdr)
		{
			if (rdr.FieldCount == 0)
				return;
			// first field = self object
			var objectDef = new FieldInfo(GetAlias(rdr.GetName(0)));
            if (objectDef.TypeName == SYSTEM_TYPE)
                return; // not needed
            else if (objectDef.TypeName == ALIASES_TYPE)
            {
                ProcessAliasesMetadata(rdr);
                return;
            }
			var rootMetadata = GetOrCreateMetadata(ROOT);
			rootMetadata.AddField(objectDef, DataType.Undefined);
			// other fields = object fields
			var typeMetadata = GetOrCreateMetadata(objectDef.TypeName);
            if (objectDef.IsArray || objectDef.IsTree)
                typeMetadata.IsArrayType = true;
            if (objectDef.IsGroup)
                typeMetadata.IsGroup = true;
            bool hasRowCount = false;
            for (int i=1; i<rdr.FieldCount; i++)
			{
				var fieldDef = new FieldInfo(GetAlias(rdr.GetName(i)));
                if (fieldDef.IsGroupMarker)
                {
                    GetOrCreateGroupMetadata(objectDef.TypeName).AddMarkerMetadata(fieldDef.PropertyName);
                    continue;
                }
                if (fieldDef.IsRowCount)
                    hasRowCount = true;
				if (!fieldDef.IsVisible)
					continue;
				DataType dt = rdr.GetFieldType(i).Name.TypeName2DataType();
				if (fieldDef.IsComplexField)
				{
					ProcessComplexMetadata(fieldDef, typeMetadata, dt);
				}
				else
				{
					var fm = typeMetadata.AddField(fieldDef, dt);
					if (fieldDef.IsRefId || fieldDef.IsArray)
					{
						// create metadata for nested object or array
						var tm = GetOrCreateMetadata(fieldDef.TypeName);
                        if (fieldDef.IsArray)
                            tm.IsArrayType = true;
					}
				}
			}
            if (hasRowCount)
                _root.AddChecked($"{objectDef.PropertyName}.$RowCount", 0);
		}


        IDictionary<String, GroupMetadata> _groupMetadata;
        IDictionary<String, ElementMetadata> _metadata;

        GroupMetadata GetOrCreateGroupMetadata(String typeName)
        {
            if (_groupMetadata == null)
                _groupMetadata = new Dictionary<String, GroupMetadata>();
            GroupMetadata groupMeta;
            if (_groupMetadata.TryGetValue(typeName, out groupMeta))
                return groupMeta;
            groupMeta = new GroupMetadata();
            _groupMetadata.Add(typeName, groupMeta);
            return groupMeta;
        }

        ElementMetadata GetOrCreateMetadata(String typeName)
		{
			if (_metadata == null)
				_metadata = new Dictionary<String, ElementMetadata>();
			ElementMetadata elemMeta;
			if (_metadata.TryGetValue(typeName, out elemMeta))
				return elemMeta;
			elemMeta = new ElementMetadata();
			_metadata.Add(typeName, elemMeta);
			return elemMeta;
		}

        public void PostProcess()
        {
        }
	}
}
