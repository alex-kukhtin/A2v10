// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Text;
using System.Threading.Tasks;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Interop;

namespace A2v10.Request
{
	public class ExecuteXmlCommand : IServerCommand
	{
		private readonly IApplicationHost _host;
		private readonly IDbContext _dbContext;

		public ExecuteXmlCommand(IApplicationHost host, IDbContext dbContext)
		{
			_host = host ?? throw new ArgumentNullException(nameof(host));
			_dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));

		}
		public async Task<ServerCommandResult> Execute(RequestCommand cmd, ExpandoObject dataToExec)
		{
			List<String> xmlSchemaPathes = null;
			if (cmd.xmlSchemas != null)
			{
				xmlSchemaPathes = new List<String>();
				foreach (var schema in cmd.xmlSchemas)
					xmlSchemaPathes.Add(_host.ApplicationReader.MakeFullPath(cmd.Path, schema + ".xsd"));
			}

			if (xmlSchemaPathes == null)
				throw new RequestModelException("The xml-schemes are not specified");

			foreach (var path in xmlSchemaPathes)
			{
				if (!_host.ApplicationReader.FileExists(path))
					throw new RequestModelException($"File not found '{path}'");
			}

			IDataModel dm = await _dbContext.LoadModelAsync(cmd.CurrentSource, cmd.XmlProcedure, dataToExec);

			var xmlCreator = new XmlCreator(xmlSchemaPathes, dm, "UTF-8")
			{
				Validate = cmd.validate
			};
			var bytes = xmlCreator.CreateXml();
			return new ServerCommandResult(Encoding.UTF8.GetString(bytes))
			{
				ContentType = "text/xml"
			};
		}
	}
}
