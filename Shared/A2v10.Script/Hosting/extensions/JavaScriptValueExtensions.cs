using ChakraHost.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Script
{
	public static class JavaScriptValueExtensions
	{
		public static String Stringify(this JavaScriptValue This)
		{
			var json = JavaScriptValue.GlobalObject.GetProperty("JSON");
			var stringify = json.GetProperty("stringify");
			var result = stringify.CallFunction(This, This);
			return result.ToString();
		}

		public static JavaScriptValue GetProperty(this JavaScriptValue This, String propertyName)
		{
			return This.GetProperty(JavaScriptPropertyId.FromString(propertyName));
		}
	}
}
