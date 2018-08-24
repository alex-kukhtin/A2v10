// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Threading.Tasks;
using System.Web;

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

			if (ru.parse == RequestUploadParseType.excel)
			{
				ExpandoObject savePrms = new ExpandoObject();
				setParams?.Invoke(savePrms);
				savePrms.Set("Id", ru.Id);
				var dm =  await SaveExcel(ru, files[0].InputStream, savePrms);
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
				IDataModel dm = await _dbContext.SaveModelAsync(ru.CurrentSource, ru.UpdateProcedure, null, prms, (table)  => {
					return xp.ParseFile(stream, table);
				});
				return dm;
			}
		}
	}
}
