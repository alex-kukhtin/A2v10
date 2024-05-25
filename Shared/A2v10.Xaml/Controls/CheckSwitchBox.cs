// Copyright © 2015-2024 Oleksandr Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public class SwitchBox : CheckBoxBase
{
	internal override String ControlType => "switchbox";
	internal override String InputControlType => "checkbox";

	internal override String InputControlClass => "switch";
}
