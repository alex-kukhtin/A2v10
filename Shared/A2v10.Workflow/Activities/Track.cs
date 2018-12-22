// Copyright © 2018 Alex Kukhtin. All rights reserved.

using System;
using System.Activities;

namespace A2v10.Workflow
{
	public class Track : CodeActivity
	{
		[RequiredArgument]
		public InArgument<String> Message { get; set; }

		protected override void Execute(CodeActivityContext context)
		{
			var process = Process.GetProcessFromContext(context);
			String msg = Message.Get<String>(context);

			var track = new TrackRecord()
			{
				ProcessId = process.Id,
				Message = msg
			};
			track.Update(process.DbContext);
		}
	}
}
