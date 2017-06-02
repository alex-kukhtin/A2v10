using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Data;

namespace A2v10.Data
{
	internal class DataModelLoader
	{
		const String ROOT = "Root";

		IDataModel _dataModel;
		public IDataModel DataModel
		{
			get
			{
				if (_dataModel != null)
					return _dataModel;
				_dataModel = new DynamicDataModel();
				return _dataModel;
			}
		}

		public void ProcessOneRecord(IDataReader rdr)
		{
			var rootFI = new FieldInfo(rdr.GetName(0));
			var modelName = rootFI.TypeName;
			var currentRecord = new Object();
			for (int i=0; i<rdr.FieldCount; i++) {
				var dataVal = rdr.GetValue(i);
				if (dataVal == DBNull.Value)
					dataVal = null;
			}			
		}

		public void ProcessOneMetadata(IDataReader rdr)
		{
			if (rdr.FieldCount == 0)
				return;
			// first field = self object
			var objectDef = new FieldInfo(rdr.GetName(0));
			var rootMetadata = GetMetadata(ROOT);
			rootMetadata.AddProperty(objectDef);

			// other fields = object fields
			var typeMetadata = GetMetadata(objectDef.TypeName);
			for (int i=1; i<rdr.FieldCount; i++)
			{
				var fieldDef = new FieldInfo(rdr.GetName(i));
				typeMetadata.AddProperty(fieldDef);
			}
		}

		IDictionary<String, ElementMetadata> _metadata;

		ElementMetadata GetMetadata(String typeName)
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
