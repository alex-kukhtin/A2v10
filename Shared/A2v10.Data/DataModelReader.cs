using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
using System.Reflection;

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

        IDataModel _dataModel;
		IdMapper _idMap = new IdMapper();
		RefMapper _refMap = new RefMapper();
		ExpandoObject _root = new ExpandoObject();
        ExpandoObject _sys = new ExpandoObject();

		public IDataModel DataModel
		{
			get
			{
				if (_dataModel != null)
					return _dataModel;
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
            for (int i=1; i<rdr.FieldCount; i++)
            {
                var fn = rdr.GetName(i);
                var dataVal = rdr.GetValue(i);
                if (fn == "!!PageSize")
                {
                    Int32 pageSize = (Int32)dataVal;
                    _sys.Add("PageSize", pageSize);
                }
            }
        }

		public void ProcessOneRecord(IDataReader rdr)
		{
			var rootFI = new FieldInfo(rdr.GetName(0));
            if (rootFI.TypeName == SYSTEM_TYPE)
            {
                ProcessSystemRecord(rdr);
                return;
            }
			var currentRecord = new ExpandoObject();
			bool bAdded = false;
			Object id = null;
            Int32 rowCount = 0;
            Boolean bHasRowCount = false;
			// from 1!
			for (int i=1; i<rdr.FieldCount; i++) {
				var dataVal = rdr.GetValue(i);
				if (dataVal == DBNull.Value)
					dataVal = null;
				var fn = rdr.GetName(i);
				FieldInfo fi = new FieldInfo(fn);
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
				}
			}
			if (!bAdded)
				AddRecordToModel(currentRecord, rootFI, id);
            if (bHasRowCount)
            {
                AddRowCount(rootFI.PropertyName, rowCount);
            }
		}

        void AddRowCount(String propertyName, Int32 rowCount)
        {
            _root.AddChecked($"{propertyName}.$RowCount", rowCount);
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
			else
				record.Add(field.PropertyName, value);
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

		public void ProcessOneMetadata(IDataReader rdr)
		{
			if (rdr.FieldCount == 0)
				return;
			// first field = self object
			var objectDef = new FieldInfo(rdr.GetName(0));
            if (objectDef.TypeName == SYSTEM_TYPE)
                return; // not needed
			var rootMetadata = GetOrCreateMetadata(ROOT);
			rootMetadata.AddField(objectDef, DataType.Undefined);

			// other fields = object fields
			var typeMetadata = GetOrCreateMetadata(objectDef.TypeName);
            if (objectDef.IsArray || objectDef.IsTree)
                typeMetadata.IsArrayType = true;
			//if (objectDef.IsTree)
				//typeMetadata.AddField(objectDef, DataType.Undefined);
			for (int i=1; i<rdr.FieldCount; i++)
			{
				var fieldDef = new FieldInfo(rdr.GetName(i));
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
		}

		IDictionary<String, ElementMetadata> _metadata;

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
