// Copyright © 2018 Alex Kukhtin. All rights reserved.

using System;
using System.Activities;

using A2v10.Data.Interfaces;

namespace A2v10.Workflow
{
	public class Track : CodeActivity
	{
		[RequiredArgument]
		public InArgument<String> Message { get; set; }

		protected override void Execute(CodeActivityContext context)
		{
			IDbContext dbContext = context.GetExtension<IDbContext>();
			var process = Process.GetProcessFromContext(context.DataContext);
			String msg = Message.Get<String>(context);
			var track = new TrackRecord()
			{
				ProcessId = process.Id,
				Message = msg
			};
			track.Update(dbContext);
		}
	}
}
