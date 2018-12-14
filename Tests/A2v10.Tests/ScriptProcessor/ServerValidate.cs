
using Microsoft.VisualStudio.TestTools.UnitTesting;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Web.Script;

using A2v10.Tests.Config;
using System.Dynamic;

namespace A2v10.Tests.ServerScripts
{
	[TestClass]
	[TestCategory("Server Scripts")]

	public class ServerValidate
	{
		readonly IDbContext _dbContext;
		readonly ILocalizer _localizer;
		readonly IApplicationHost _host;

		public ServerValidate()
		{
			TestConfig.Start();
			var loc = ServiceLocator.Current;
			_dbContext = loc.GetService<IDbContext>();
			_localizer = loc.GetService<ILocalizer>();
			_host = loc.GetService<IApplicationHost>();
		}

		[TestMethod]
		public void ServerScriptValidate()
		{
			IDataScripter scripter = new VueDataScripter(_host, _localizer);
			var sp = new ScriptProcessor(scripter, _host);
			var ssi = new ServerScriptInfo()
			{
				DataModel = _dbContext.LoadModel(null, "a2test.[Document.Load]"),
				Template = "document.template",
				Path = "document/server",
				RawData = "{Document: {Id:173}}",
				Parameter = new {Id = 123, Text = "ParamText"}
			};
			var result = sp.ValidateModel(ssi);
			Assert.IsNull(result);
		}
	}
}
