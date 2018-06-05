// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using Newtonsoft.Json;

namespace A2v10.Request.Models
{
	public class SaveFeedbackModel
	{
		public Int64 UserId { get; set; }
		[JsonProperty("text")]
		public String Text { get; set; }
	}
}
