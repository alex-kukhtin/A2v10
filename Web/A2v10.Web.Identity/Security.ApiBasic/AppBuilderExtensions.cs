// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using Owin;

using Microsoft.Owin.Extensions;

namespace A2v10.Web.Identity.ApiBasic
{
	public static class ApiBasicAppBuilderExtensions
	{
		public static IAppBuilder UseApiBasicAuthentication(this IAppBuilder app, ApiBasicAuthenticationOptions options = null)
		{
			if (app == null)
				throw new ArgumentNullException(nameof(app));

			options ??= new ApiBasicAuthenticationOptions();

			app.Use<ApiBasicAuthenticationMiddleware>(app, options);
			app.UseStageMarker(PipelineStage.Authenticate);

			return app;
		}
	}
}
