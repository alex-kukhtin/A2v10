
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace XamExtensionsSample
{
	public class ActionHandler : IRenderer
	{
		public ActionHandler(IDbContext dbContext, IApplicationHost host)
		{
		}

		public void Render(RenderInfo info)
		{
			info.Writer.Write($"<div id=\"{info.RootId}\">I AM THE TEXT FROM C#</div>");
		}
	}
}
