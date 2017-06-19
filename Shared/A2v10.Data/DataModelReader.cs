using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;

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

		IDataModel _dataModel;
		IdMapper _idMap = new IdMapper();
		RefMapper _refMap = new RefMapper();
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
			Object id = null;
			// from 1!
			for (int i=1; i<rdr.FieldCount; i++) {
				var dataVal = rdr.GetValue(i);
				if (dataVal == DBNull.Value)
					dataVal = null;
				var fn = rdr.GetName(i);
				FieldInfo fi = new FieldInfo(fn);
				AddValueToRecord(currentRecord, fi, dataVal);
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
		}

		void AddRecordToArray(String propName, Object id, ExpandoObject currentRecord)
		{
			var pxa = propName.Split('.'); // <Type>.PropName
			if (pxa.Length != 2)
				throw new DataLoaderException($"Invalid field name 'propName'. 'TypeName.PropertyName' expected");
			/*0-key, 1-Property*/
			var key = Tuple.Create(pxa[0], id);
			var mapObj = _idMap[key];
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
			var rootMetadata = GetOrCreateMetadata(ROOT);
			rootMetadata.AddField(objectDef, DataType.Undefined);

			// other fields = object fields
			var typeMetadata = GetOrCreateMetadata(objectDef.TypeName);
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
					typeMetadata.AddField(fieldDef, dt);
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
