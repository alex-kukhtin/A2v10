using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using A2v10.Infrastructure;

namespace A2v10.Xaml.Bootstrap
{
	public enum BsAlign
	{
		None,
		Baseline,
		Top,
		Middle,
		Bottom,
		TextTop,
		TextBottom
	}

	public enum BsAlignItems
	{
		None,
		Start,
		End,
		Center,
		Baseline,
		Stretch
	}

	public class AlignItems2
	{
		BsAlignItems Default { get; set; }
		BsAlignItems Small { get; set; }
		BsAlignItems Medium { get; set; }
		BsAlignItems Large { get; set; }

		private String ToClassInt(BsAlignItems ai, String prefix)
		{
			if (ai != BsAlignItems.None)
				return $"align-items{prefix}-{ai.ToString().ToLowerInvariant()} ";
			return String.Empty;
		}

		String ToClass()
		{
			StringBuilder sb = new StringBuilder();
			sb.Append(ToClassInt(Default, String.Empty))
			.Append(ToClassInt(Small, "-sm"))
			.Append(ToClassInt(Medium, "-md"))
			.Append(ToClassInt(Large, "-lg"));
			sb.TrimRight();
			return sb.ToString();
		}
	}
}
