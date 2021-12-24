
using A2v10.Infrastructure;
using A2v10.Lang;
using A2v10.Web.Config;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace A2v10.Tests.Lang
{
	[TestClass]
	[TestCategory("Workflow")]
	public class TSParserTest
	{
		[TestMethod]
		public void ParseFile()
		{
			var profiler = new NullProfiler();
			var userLocale = new WebUserLocale();
			var host = new WebApplicationHost(profiler, userLocale, null);
			host.StartApplication(false);
			var parser = new TSDefParser(host.ApplicationReader, "typescript");
			parser.Parse("model.d.ts");
		}
	}
}
