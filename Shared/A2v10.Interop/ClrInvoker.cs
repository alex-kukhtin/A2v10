// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Reflection;

using A2v10.Infrastructure;

namespace A2v10.Interop
{
	public class ClrInvoker
	{
		void CallInject(Object instance)
		{
			var type = instance.GetType();
			var minject = type.GetMethod("Inject", BindingFlags.Public | BindingFlags.Instance);
			if (minject == null) return;
			var injprms = minject.GetParameters();
			var injparsToCall = new List<Object>();

			foreach (var ip in injprms)
			{
				if (ip.ParameterType.IsInterface)
				{
					injparsToCall.Add(ServiceLocator.Current.GetService(ip.ParameterType));
				}
				else
				{
					throw new InteropException("Invalid inject type");
				}
			}
			minject.Invoke(instance, injparsToCall.ToArray());
		}

		Object CallInvoke(Object instance, ExpandoObject parameters)
		{
			var type = instance.GetType();
			var method = type.GetMethod("Invoke", System.Reflection.BindingFlags.Public | BindingFlags.Instance);
			if (method == null)
				throw new InteropException($"Method: 'Invoke' is not found in type '{type.FullName}'");

			var mtdParams = method.GetParameters();
			var prmsD = parameters as IDictionary<String, Object>;

			List<Object> parsToCall = new List<Object>();

			for (int i = 0; i < mtdParams.Length; i++)
			{
				var pi = mtdParams[i];
				if (pi.Name == "UserId" && pi.ParameterType == typeof(Int64))
				{
					// TODO: UserId ????
					parsToCall.Add(parameters.Get<Int64>("UserId"));
				}
				else if (prmsD.TryGetValue(pi.Name, out Object srcObj))
				{
					if (srcObj == null)
					{
						parsToCall.Add(pi.DefaultValue);
					}
					else if (srcObj is ExpandoObject && !pi.ParameterType.IsPrimitive)
					{
						// TODO: Object convert
						//var strJson = JsonConvert.SerializeObject(srcObj, jssToJson);
						//parsToCall.Add(JsonConvert.DeserializeObject(strJson, pi.ParameterType, jssFromJson));
						//parsToCall.Add(srcObj);
					}
					else
					{
						var px = pi.ParameterType;
						if (px.IsNullableType())
							px = px.GetNonNullableType();
						if (px == typeof(DateTime))
						{
							// convert date to Local
							//parsToCall.Add(((DateTime)srcObj).ToLocalTime());
							parsToCall.Add((DateTime)srcObj);

						}
						else
							parsToCall.Add(Convert.ChangeType(srcObj, pi.ParameterType));
					}
				}
				else
				{
					parsToCall.Add(pi.DefaultValue);
				}
			}
			return method.Invoke(instance, parsToCall.ToArray());
		}

		public Object Invoke(String clrType, ExpandoObject parameters)
		{
			var names = clrType.Split(';');
			if (names.Length != 2)
				throw new InteropException($"Invalid type name: {clrType}. Must be: 'FullTypeName; assembly=AssemblyName'");
			String assemblyName = names[1].Trim();
			String typeName = names[0].Trim();
			var assNames = assemblyName.Split('=');
			if (assNames.Length != 2 || assNames[0].Trim() != "assembly")
				throw new InteropException($"Invalid type name: {clrType}. Must be: 'FullTypeName; assembly=AssemblyName'");
			assemblyName = assNames[1].Trim();
			Object instance = null;
			try
			{
				instance = System.Activator.CreateInstance(assemblyName, typeName).Unwrap() as Object;
			}
			catch (Exception /*ex*/)
			{
				throw new InteropException($"Could not create type '{typeName}'");
			}
			if (!(instance is IInvokeTarget))
			{
				throw new InteropException($"The type: '{typeName}' must implement interface 'IInvokeTarget'");
			}
			CallInject(instance);
			return CallInvoke(instance, parameters);
		}
	}
}
