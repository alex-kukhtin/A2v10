// Copyright © 2012-2019 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Dynamic;
using System.Runtime.Serialization;
using System.Text;

namespace A2v10.Workflow
{
	[DataContract]
	public class RequestResult
	{
		[DataMember]
		public Int64 UserId { get; set; }

		[DataMember]
		public Int64 InboxId { get; set; }

		[DataMember]
		public String Answer { get; set; }

		[DataMember]
		public String Comment { get; set; }

		// non serializable!
		public ExpandoObject Params { get; set; }

		public T ParamValue<T>(String Expression)
		{
			if (Params == null)
				throw new WorkflowException("There are no Params in RequestResult");
			return Params.Eval<T>(Expression, default, throwIfError: true);
		}

		public String Resolve(String expr)
		{

			if (String.IsNullOrEmpty(expr))
				return expr;
			var sb = new StringBuilder(expr);
			sb.Replace("{{Answer}}", Answer);
			sb.Replace("{{Comment}}", Comment);
			return sb.ToString();
		}
	}
}
