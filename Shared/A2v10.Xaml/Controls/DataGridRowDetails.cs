// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{

	[ContentProperty("Content")]
	public class DataGridRowDetails : XamlElement
	{
		public UIElementBase Content { get; set; }
		public RowDetailsActivate Activate { get; set; }
		public Boolean Visible { get; set; }
	}
}
