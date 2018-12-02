using A2v10.Data.Interfaces;
using A2v10.Data.Tests.Configuration;
using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Web.Script;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Tests
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
			var ss = Starter.Create();
			_dbContext = ss.dbContext;
			_localizer = ss.localizer;
			_host = ss.host;
		}

		[TestMethod]
		public void ServerScriptValidate()
		{
			IDataScripter scripter = new VueDataScripter(_host, _localizer);
			var sp = new ScriptProcessor(scripter, _host);
			IDataModel dm = _dbContext.LoadModel(null, "a2test.[Document.Load]");
			sp.ValidateModel(dm, "const template = {};");
		}
	}
}
