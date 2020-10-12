
using Microsoft.VisualStudio.TestTools.UnitTesting;
using A2v10.Lang;
using A2v10.Tests.Config;
using A2v10.Infrastructure;

namespace A2v10.Tests.Lang
{
	[TestClass]
	[TestCategory("Workflow")]
	public class TSParserTest
	{
		private readonly IApplicationHost _host;
		public TSParserTest()
		{
			TestConfig.Start();
			_host = ServiceLocator.Current.GetService<IApplicationHost>();
		}

		[TestMethod]
		public void ParseFile()
		{
			var parser = new TSDefParser(_host.ApplicationReader, "c:\\git\\a2v10\\apps\\Develop\\sales\\waybill");
			parser.Parse("c:\\git\\a2v10\\apps\\Develop\\sales\\waybill\\model.d.ts");
		}
	}
}
