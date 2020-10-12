
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
		private readonly IDbContext _dbContext;
		private readonly ILocalizer _localizer;
		private readonly IApplicationHost _host;
		private readonly IApplicationConfig _config;

		public ServerValidate()
		{
			TestConfig.Start();
			var loc = ServiceLocator.Current;
			_dbContext = loc.GetService<IDbContext>();
			_localizer = loc.GetService<ILocalizer>();
			_host = loc.GetService<IApplicationHost>();
			_config = loc.GetService<IApplicationConfig>();
			_host.StartApplication(false);
		}

		[TestMethod]
		public void ServerScriptValidate()
		{
			IDataScripter scripter = new VueDataScripter(_config, _host, _localizer);
			var sp = new ScriptProcessor(scripter, _config, _host);
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
