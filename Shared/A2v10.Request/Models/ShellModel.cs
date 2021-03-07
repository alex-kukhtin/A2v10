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

	public class SwitchToCompanySaveModel
	{
		public Int64 UserId { get; set; }
		public Int32 TenantId { get; set; }
		public Int64 CompanyId { get; set; }
	}

}
