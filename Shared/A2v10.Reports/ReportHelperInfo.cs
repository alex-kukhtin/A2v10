// Copyright © 2022 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Threading.Tasks;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Request;

namespace A2v10.Reports
{
	public class ReportContext
	{
		public Int64 UserId;
		public Int32 TenantId;
		public Int64 CompanyId;
	}


	public class ReportInfo : IStumulsoftReportInfo
	{
		public IDataModel DataModel { get; set; }
		public String Name { get; set; }
		public ExpandoObject Variables { get; set; }

		public String ReportPath;
		public Byte[] ReportStream;
		public RequestReportType Type;
		public IList<String> XmlSchemaPathes;
		public String Encoding;
		public Boolean Validate;

		public Stream GetStream(IApplicationReader reader)
		{
			if (!String.IsNullOrEmpty(ReportPath))
				return reader.FileStreamFullPathRO(ReportPath);
			else if (ReportStream != null)
				return new MemoryStream(ReportStream);
			throw new InvalidOperationException("Invalid report stream mode");
		}
	}

	public sealed class ReportHelperInfo
	{
		readonly IApplicationHost _host;
		private readonly IDbContext _dbContext;
		private readonly ILocalizer _localizer;
		private readonly IUserStateManager _userStateManager;
		public ReportHelperInfo(IApplicationHost host)
		{
			_host = host;
			IServiceLocator locator = host.Locator;
			_dbContext = locator.GetService<IDbContext>() ?? throw new ArgumentNullException(nameof(_dbContext));
			_localizer = locator.GetService<ILocalizer>() ?? throw new ArgumentNullException(nameof(_localizer));
			_userStateManager = locator.GetServiceOrNull<IUserStateManager>() ?? throw new ArgumentNullException(nameof(_userStateManager));
		}

		public async Task<ReportInfo> GetReportInfo(ReportContext context, String url, String id, ExpandoObject prms)
		{
			var appReader = _host.ApplicationReader;
			var ri = new ReportInfo();
			RequestModel rm = await RequestModel.CreateFromBaseUrl(_host, url);
			var rep = rm.GetReport();

			rep.CheckPermissions(_userStateManager?.GetUserPermissions(), _host.IsDebugConfiguration);

			ri.Type = rep.type;

			if (rep.type == RequestReportType.xml)
			{
				if (rep.xmlSchemas != null)
				{
					ri.XmlSchemaPathes = new List<String>();
					foreach (var schema in rep.xmlSchemas)
						ri.XmlSchemaPathes.Add(appReader.MakeFullPath(rep.Path, schema + ".xsd"));
				}

				ri.Encoding = rep.encoding;
				ri.Validate = rep.validate;
			}

			prms.Set("UserId", context.UserId);
			if (_host.IsMultiTenant || context.TenantId != 0 /*hack for desktop*/)
				prms.Set("TenantId", context.TenantId);
			if (_host.IsMultiCompany)
				prms.Set("CompanyId", context.CompanyId);
			prms.Set("Id", id);
			prms.AppendIfNotExists(rep.parameters);

			ri.DataModel = await _dbContext.LoadModelAsync(rep.CurrentSource, rep.ReportProcedure, prms);

			CheckTypes(rep.Path, rep.checkTypes, ri.DataModel);

			// after query
			ExpandoObject vars = rep.variables;
			if (vars == null)
				vars = new ExpandoObject();
			vars.Set("UserId", context.UserId);
			if (_host.IsMultiTenant)
				vars.Set("TenantId", context.TenantId);
			if (_host.IsMultiCompany)
				vars.Set("CompanyId", context.CompanyId);
			vars.Set("Id", id);
			ri.Variables = vars;
			var repName = _localizer.Localize(null, String.IsNullOrEmpty(rep.name) ? rep.ReportName : rep.name);
			if (ri.DataModel != null && ri.DataModel.Root != null)
				repName = ri.DataModel.Root.Resolve(repName);
			ri.Name = repName;

			if (rep.ReportFromDataModel)
			{
				ri.ReportStream = ri.DataModel.Eval<Byte[]>(rep.ReportExpression);
				if (ri.ReportStream == null)
					throw new InvalidDataException($"Expression '{rep.ReportName}'  is null");
			}
			else if (rep.HasPath)
				ri.ReportPath = appReader.MakeFullPath(rep.Path, rep.ReportName + rep.GetExtension());

			return ri;
		}

		ITypeChecker CheckTypes(String path, String typesFile, IDataModel model)
		{
			if (!_host.IsDebugConfiguration)
				return null;
			if (String.IsNullOrEmpty(typesFile))
				return null;
			var tc = new TypeChecker(_host.ApplicationReader, path);
			tc.CreateChecker(typesFile, model);
			return tc;
		}
	}
}
