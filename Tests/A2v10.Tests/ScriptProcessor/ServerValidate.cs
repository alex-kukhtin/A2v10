using A2v10.Data.Interfaces;
using A2v10.Data.Tests.Configuration;
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
		IDbContext _dbContext;
		public ServerValidate()
		{
			_dbContext = Starter.Create();
		}

		[TestMethod]
		public void ServerScriptValidate()
		{
			IDataScripter scripter = new VueDataScripter();
			var sp = new ScriptProcessor(scripter);
			IDataModel dm = _dbContext.LoadModel(null, "a2test.[Document.Load]");
			sp.ValidateModel(dm, "const template = {};");
		}
	}
}
