// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Activities;
using A2v10.Data.Interfaces;

namespace A2v10.Workflow
{
	public class ExecuteSql : NativeActivity<IDbContext>
	{
		[RequiredArgument]
		public InArgument<String> Command { get; set; }

		public InArgument<String> DataSource { get; set; }

		public InArgument<Object> Params { get; set; }

		protected override void Execute(NativeActivityContext context)
		{
			String command = Command.Get(context);
			String dataSource = DataSource.Get(context);
			Object prms = Params.Get(context);
			IDbContext dbContext = context.GetExtension<IDbContext>();
			IDataModel dataModel = dbContext.LoadModel(dataSource, command, prms);
			this.Result.Set(context, dataModel);
		}
	}
}
