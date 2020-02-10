// Copyright © 2020 Alex Kukhtin. All rights reserved.

using Owin;
using System;

namespace A2v10.Web.Mvc.Start
{

	public class StaticFilesCacheOptions
	{
		public Int32 Days { get; set; } = 30;
		public Int32 Seconds => Days * (24 * 60 * 60);

		public Boolean CachePathEnabled(String path)
		{
			return path.EndsWith(".js") || path.EndsWith(".css") || path.EndsWith(".woff");
		}
	}

	public static class CacheForStaticFiles
	{
		public static void UseCacheForStaticFiles(this IAppBuilder app, StaticFilesCacheOptions options = null)
		{
			if (options == null)
				options = new StaticFilesCacheOptions();
			app.Use(async (context, next) =>
			{
				if (!context.Response.Headers.Keys.Contains("Cache-Control"))
				{
					var path = context.Request.Path.Value;
					if (options.CachePathEnabled(path))
					{
						context.Response.Headers.Add("Cache-Control", new[] { $"public, max-age={options.Seconds}" });
					}
				}
				await next();
			});
		}
	}
}
