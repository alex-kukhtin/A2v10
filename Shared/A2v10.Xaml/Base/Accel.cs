// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Text;

namespace A2v10.Xaml
{
	public class Accel : XamlElement
	{
		public String Key { get; set; }
		
		// CASM - modifiers (control, alt, shift, meta)
		// Ctrl + A => C___:KeyA
		public String GetKeyCode()
		{
			if (Key.Contains("+"))
			{
				var modifiers = new StringBuilder("____:");
				var x = Key.Split('+');
				var keyName = KeyName2EventCode(x[x.Length - 1]); // last char
				for (Int32 i=0; i<x.Length - 1; i++)
				{
					switch (x[i].Trim())
					{
						case "Shift":
							modifiers[2] = 'S';
							break;
						case "Control":
						case "Ctrl":
							modifiers[0] = 'C';
							break;
						case "Alt":
							modifiers[1] = 'A';
							break;
						case "Meta":
							modifiers[3] = 'M';
							break;
						default:
							throw new XamlException($"Invalid key modifier value: '{x[i]}' ");
					}
				}
				return modifiers.ToString() + keyName;
			}
			return "____:" + KeyName2EventCode(Key);
		}

		String KeyName2EventCode(String keyName)
		{
			keyName = keyName.Trim();
			if (keyName.Length == 1 && keyName[0] >= 'A' && keyName[0] <= 'Z')
				return $"Key{keyName}";
			else if (keyName.Length == 1 && keyName[0] >= '0' && keyName[0] <= '9')
				return $"Digit{keyName}";
			else if (keyName == "Left" || keyName == "Right" || keyName == "Up" || keyName == "Down")
				return $"Arrow{keyName}";
			else if (keyName.Length > 1 && keyName.StartsWith("F"))
				return keyName;
			return keyName;
		}
	}
}
