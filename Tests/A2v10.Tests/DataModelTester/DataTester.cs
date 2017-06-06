﻿using A2v10.Infrastructure;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Tests.DataModelTester
{
	internal class DataTester
	{
		IDataModel _dataModel;
		ExpandoObject _instance;
		IList<ExpandoObject> _instanceArray;
		public DataTester(IDataModel dataModel, String expression)
		{
			_dataModel = dataModel;
			_instance = dataModel.Eval<ExpandoObject>(expression);
			_instanceArray = dataModel.Eval<IList<ExpandoObject>>(expression);
			Assert.IsTrue(_instance != null || _instanceArray != null, $"Could not evaluate expression '{expression}'");
				
		}

		public void AllProperties(String props)
		{
			var propArray = props.Split(',');
			var dict = _instance as IDictionary<String, Object>;
			foreach (var prop in propArray)
				Assert.IsTrue(dict.ContainsKey(prop), $"Property {prop} not found");
			Assert.AreEqual(propArray.Length, dict.Count, $"invalid length for '{props}'");
		}

		public void AreValueEqual<T>(T expected, String property)
		{
			var obj = _instance as IDictionary<String, Object>;
			Assert.AreEqual(expected, obj[property]);
		}

		public void IsArray(int length = -1)
		{
			Assert.IsTrue(_instanceArray != null && _instance == null);
			if (length != -1)
				Assert.AreEqual(length, _instanceArray.Count);
		}

		public void AreArrayValueEqual<T>(T expected, int index, String property)
		{
			IsArray();
			var obj = _instanceArray[index] as IDictionary<String, Object>;
			Assert.AreEqual(expected, obj[property]);
		}

	}
}