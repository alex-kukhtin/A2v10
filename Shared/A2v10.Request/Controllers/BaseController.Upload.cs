// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Threading.Tasks;
using System.Web;

using Newtonsoft.Json;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Interop;

namespace A2v10.Request
{
	public partial class BaseController
	{
		public async Task SaveUploads(String pathInfo, HttpFileCollectionBase files, Action<ExpandoObject> setParams, TextWriter writer)
		{
			var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, pathInfo);
			ExpandoObject prms = new ExpandoObject();
			var ru = rm.GetUpload();

			if (!String.IsNullOrEmpty(ru.clrType))
			{
				ExpandoObject savePrms = new ExpandoObject();
				setParams?.Invoke(savePrms);
				savePrms.Set("Id", ru.Id);
				savePrms.Set("Stream", files[0].InputStream);
				savePrms.Set("FileName", files[0].FileName);
				var result = await DoUploadClr(ru, savePrms);
				writer.Write(JsonConvert.SerializeObject(result, StandardSerializerSettings));
			}
			else if (ru.parse == RequestUploadParseType.excel)
			{
				ExpandoObject savePrms = new ExpandoObject();
				setParams?.Invoke(savePrms);
				savePrms.Set("Id", ru.Id);
				var dm = await SaveExcel(ru, files[0].InputStream, savePrms);
				WriteDataModel(dm, writer);
			}
			else
			{
				throw new NotImplementedException();
			}
		}

		async Task<IDataModel> SaveExcel(RequestUpload ru, Stream stream, ExpandoObject prms)
		{
			using (var xp = new ExcelParser())
			{
				xp.ErrorMessage = "UI:@[Error.FileFormatException]";
				IDataModel dm = await _dbContext.SaveModelAsync(ru.CurrentSource, ru.UpdateProcedure, null, prms, (table) => {
					return xp.ParseFile(stream, table);
				});
				return dm;
			}
		}

		async Task<Object> DoUploadClr(RequestUpload ru, ExpandoObject prms)
		{
			var invoker = new ClrInvoker();
			Object result;
			if (ru.async)
				result = await invoker.InvokeAsync(ru.clrType, prms);
			else
				result = invoker.Invoke(ru.clrType, prms);
			return result;
		}
	}
}
