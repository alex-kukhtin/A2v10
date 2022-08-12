
using Microsoft.VisualStudio.TestTools.UnitTesting;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Request;

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
			_host.StartApplication(false);
		}

		[TestMethod]
		public void ServerScriptValidate()
		{
		}
	}
}
