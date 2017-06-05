using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;

/*
 * TODO: 
 * 1. Complex Fields
 * 2. Maps
 * 3. Nested lists
 */

namespace A2v10.Data
{
	internal class DataModelLoader
	{
		const String ROOT = "TRoot";

		IDataModel _dataModel;
		IdMapper _idMap = new IdMapper();
		ExpandoObject _root = new ExpandoObject();

		public IDataModel DataModel
		{
			get
			{
				if (_dataModel != null)
					return _dataModel;
				_dataModel = new DynamicDataModel(_metadata, _root);
				return _dataModel;
			}
		}


		public void ProcessOneRecord(IDataReader rdr)
		{
			var rootFI = new FieldInfo(rdr.GetName(0));
			var currentRecord = new ExpandoObject();
			bool bAdded = false;
			for (int i=0; i<rdr.FieldCount; i++) {
				var dataVal = rdr.GetValue(i);
				if (dataVal == DBNull.Value)
					dataVal = null;
				var fn = rdr.GetName(i);
				FieldInfo fi = new FieldInfo(fn);
				AddValueToRecord(currentRecord, fi, dataVal);
				if (fi.IsId)
					_idMap.Add(rootFI.PropertyName, dataVal, currentRecord);
				//else if (fi.IsRefId)
				if (fi.IsParentId)
				{
					if (rootFI.IsArray)
						AddRecordToArray(fi.TypeName, dataVal, currentRecord);
					// Найдем элемент fi.TypeName[dataVal]
					int fx = 2221; // TODO:
					bAdded = true;
				}
			}
			if (!bAdded)
				AddRecordToModel(currentRecord, rootFI);
		}

		void AddRecordToArray(String propName, Object id, ExpandoObject currentRecord)
		{
			// TODO:Complex Path
			var pxa = propName.Split('.'); // <Path>.PropName
			/*0-key, 1-Property*/
			var key = Tuple.Create(pxa[0], id);
			var objList = _idMap[key];
			foreach (var target in objList)
				target.AddToArray(pxa[1], currentRecord);
		}

		void AddValueToRecord(IDictionary<String, Object> record, FieldInfo field, Object value)
		{
			if (!field.IsVisible)
				return;
			if (field.IsArray)
				record.Add(field.PropertyName, new List<ExpandoObject>());
			else
				record.Add(field.PropertyName, value);
		}

		void AddRecordToModel(ExpandoObject currentRecord, FieldInfo field)
		{
			if (field.IsArray)
			{
				_root.AddToArray(field.PropertyName, currentRecord);
			}
			else if (field.IsObject)
			{
				_root.Add(field.PropertyName, currentRecord);
			}
		}


		void ProcessComplexMetadata(FieldInfo fieldInfo, ElementMetadata elem)
		{
			// create metadata for nested type
			GetOrCreateMetadata(fieldInfo.TypeName);
			// add property to element
			var fna = fieldInfo.PropertyName.Split('.'); 
		}

		public void ProcessOneMetadata(IDataReader rdr)
		{
			if (rdr.FieldCount == 0)
				return;
			// first field = self object
			var objectDef = new FieldInfo(rdr.GetName(0));
			var rootMetadata = GetOrCreateMetadata(ROOT);
			rootMetadata.AddField(objectDef, objectDef.FieldType);

			// other fields = object fields
			var typeMetadata = GetOrCreateMetadata(objectDef.TypeName);
			for (int i=1; i<rdr.FieldCount; i++)
			{
				var fieldDef = new FieldInfo(rdr.GetName(i));
				if (!fieldDef.IsVisible)
					continue;
				FieldType ft = rdr.GetFieldType(i).Name.TypeName2FieldType();
				if (fieldDef.IsComplexField)
				{
					ProcessComplexMetadata(fieldDef, typeMetadata);
				}
				else
				{
					typeMetadata.AddField(fieldDef, ft);
					if (fieldDef.IsRefId || fieldDef.IsArray)
					{
						// create metadata for nested object or array
						GetOrCreateMetadata(fieldDef.TypeName);
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
	}
}
