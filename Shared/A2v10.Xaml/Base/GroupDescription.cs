// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
	public class GroupDescription : XamlElement, IJavaScriptSource
	{
		public String GroupBy { get; set; }
		public Boolean Count { get; set; }
		public Boolean Collapsed { get; set; }
		public String Title { get; set; }

		public String GetJsValue()
		{
			if (String.IsNullOrEmpty(GroupBy))
				throw new XamlException("GroupBy property is required");
			var sb = new StringBuilder($"{{prop: '{GroupBy.EncodeJs()}'");
			if (Collapsed)
				sb.Append(", expanded:").Append((!Collapsed).ToString().ToLowerInvariant());
			if (Count)
				sb.Append(", count: true");
			if (!String.IsNullOrEmpty(Title))
				sb.Append($", title: '{Title.EncodeJs()}' ");
			sb.Append("}");
			return sb.ToString();
		}
	}

	public class GroupDescriptions : List<GroupDescription>, IJavaScriptSource
	{
		public String GetJsValue()
		{
			if (Count == 0)
				return null;
			StringBuilder sb = new StringBuilder("[");
			foreach (var d in this)
			{
				sb.Append(d.GetJsValue()).Append(',');
			}
			sb.RemoveTailComma();
			sb.Append("]");
			return sb.ToString();
		}
	}
}
