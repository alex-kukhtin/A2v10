using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(A2v10.Web.Mvc.Start.Startup))]
namespace A2v10.Web.Mvc.Start
{
	public partial class Startup
	{
		public void Configuration(IAppBuilder app)
		{
			ConfigureAuth(app);
            StartServices();
		}
	}
}
