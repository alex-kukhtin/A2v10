// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Reflection;
using System.Threading.Tasks;

using A2v10.Infrastructure;

using Newtonsoft.Json;

namespace A2v10.Interop
{
	public class ClrInvoker
	{
		private Boolean _enableThrow;
		private IRequestInfo _requestInfo;

		Object DefaultValue(Type tp)
		{
			return tp.IsValueType ? Activator.CreateInstance(tp) : null;
		}

		public void SetRequestInfo(IRequestInfo info)
		{
			_requestInfo = info;
		}

		public static void CallInject(Object instance)
		{
			var type = instance.GetType();
			var minject = type.GetMethod("Inject", BindingFlags.Public | BindingFlags.Instance);
			if (minject == null)
				return;
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

		public static void CallSetRequestInfo(Object instance, IRequestInfo info)
		{
			if (info == null)
				return;
			var type = instance.GetType();
			var miSetRI = type.GetMethod("SetRequestInfo", BindingFlags.Public | BindingFlags.Instance);
			if (miSetRI == null)
				return;
			miSetRI.Invoke(instance, new Object[] { info });
		}

		Object[] GetParameters(MethodInfo method, ExpandoObject parameters, Guid? guid)
		{
			var mtdParams = method.GetParameters();
			var prmsD = parameters as IDictionary<String, Object>;

			List<Object> parsToCall = new List<Object>();

			for (Int32 i = 0; i < mtdParams.Length; i++)
			{
				var pi = mtdParams[i];
				if (pi.Name == "UserId" && pi.ParameterType == typeof(Int64))
				{
					parsToCall.Add(parameters.Get<Int64>("UserId"));
				}
				else if (guid != null && pi.Name == "Guid" && pi.ParameterType == typeof(Guid))
				{
					parsToCall.Add(guid.Value);
				}
				else if (prmsD.TryGetValue(pi.Name, out Object srcObj))
				{
					if (srcObj == null)
					{
						parsToCall.Add(DefaultValue(pi.ParameterType));
					}
					else if (srcObj is ExpandoObject && !pi.ParameterType.IsPrimitive)
					{
						var strJson = JsonConvert.SerializeObject(srcObj);
						parsToCall.Add(JsonConvert.DeserializeObject(strJson, pi.ParameterType));
					}
					else
					{
						var px = pi.ParameterType;
						if (px.IsNullableType())
							px = px.GetNonNullableType();
						if (pi.ParameterType.IsAssignableFrom(srcObj.GetType()))
							parsToCall.Add(srcObj);
						else
							parsToCall.Add(Convert.ChangeType(srcObj, pi.ParameterType));
					}
				}
				else
				{
					parsToCall.Add(DefaultValue(pi.ParameterType));
				}
			}

			return parsToCall.ToArray();
		}

		async Task<Object> CallInvokeAsync(Object instance, ExpandoObject parameters, Guid? guid)
		{
			var type = instance.GetType();
			var method = type.GetMethod("InvokeAsync", BindingFlags.Public | BindingFlags.Instance);
			if (method == null)
				throw new InteropException($"Method: 'InvokeAsync' is not found in type '{type.FullName}'");
			var parsToCall = GetParameters(method, parameters, guid);
			return await (Task<Object>) method.Invoke(instance, parsToCall);
		}

		Object CallInvoke(Object instance, ExpandoObject parameters, Guid? guid)
		{
			var type = instance.GetType();
			var method = type.GetMethod("Invoke", BindingFlags.Public | BindingFlags.Instance);
			if (method == null)
				throw new InteropException($"Method: 'Invoke' is not found in type '{type.FullName}'");
			var parsToCall = GetParameters(method, parameters, guid);
			return method.Invoke(instance, parsToCall);
		}

		public Object CreateInstance(String clrType)
		{
			var (assembly, type) = ClrHelpers.ParseClrType(clrType);

			Object instance = null;
			try
			{
				instance = System.Activator.CreateInstance(assembly, type).Unwrap() as Object;
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				throw new InteropException($"Could not create type '{type}'. exception: '{ex.Message}'");
			}
			if (!(instance is IInvokeTarget))
			{
				throw new InteropException($"The type: '{type}' must implement interface 'IInvokeTarget'");
			}
			return instance;
		}

		public Object Invoke(String clrType, ExpandoObject parameters, Guid? guid = null)
		{
			Object instance = CreateInstance(clrType);
			CallInject(instance);
			CallSetRequestInfo(instance, _requestInfo);
			if (_enableThrow)
				EnableThrowForInstance(instance);
			return CallInvoke(instance, parameters, guid);
		}

		public async Task<Object> InvokeAsync(String clrType, ExpandoObject parameters, Guid? guid = null)
		{
			Object instance = CreateInstance(clrType);
			CallInject(instance);
			CallSetRequestInfo(instance, _requestInfo);
			if (_enableThrow)
				EnableThrowForInstance(instance);
			return await CallInvokeAsync(instance, parameters, guid);
		}

		void EnableThrowForInstance(Object instance)
		{
			var type = instance.GetType();
			var miEnableThrow = type.GetMethod("EnableThrow", BindingFlags.Public | BindingFlags.Instance);
			if (miEnableThrow != null)
				miEnableThrow.Invoke(instance, null);
		}

		public void EnableThrow()
		{
			_enableThrow = true;
		}

	}
}
