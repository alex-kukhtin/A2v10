// Copyright © 2022 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public class SelectorSimple : Selector
{

	public String Url { get; set; }
	public String Data { get; set; }

	protected override void OnEndInit()
	{
		base.OnEndInit();

		DisplayProperty = "Name";
		Fetch = $"{Url}/fetch";
		var hlink = new Hyperlink()
		{
			Icon = Icon.Search,
		};
		var cmd = new BindCmd()
		{
			Command = CommandType.Browse,
			Url = $"{Url}/browse",
		};
		var val = this.GetBinding(nameof(Value));
		if (val != null)
			cmd.BindImpl.SetBinding("Argument", new Bind() { Path = val.Path });
		var dat = this.GetBinding("Data");
		if (dat != null)
		{
			cmd.BindImpl.SetBinding("Data", dat);
			this.BindImpl.SetBinding(nameof(FetchData), dat);
		}
		hlink.BindImpl.SetBinding("Command", cmd);
		AddOns.Add(hlink);
	}
}
