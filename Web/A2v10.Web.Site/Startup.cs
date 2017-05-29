using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(A2v10.Web.Site.Startup))]
namespace A2v10.Web.Site
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
