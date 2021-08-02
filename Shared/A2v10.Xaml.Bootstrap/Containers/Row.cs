using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml.Bootstrap
{
	public class Row : BsContainer
	{
		public override string ContainerClass => "row";
		/*????*/
		BsAlignItems AlignItems { get; set; }
		BsAlignItems AlignItemsSm { get; set; }
		BsAlignItems AlignItemsMd { get; set; }
		BsAlignItems AlignItemsLg { get; set; }
		BsAlignItems AlignItemsXl { get; set; }
		BsAlignItems AlignItemsXxl { get; set; }

		//JustifyContent JustifyContent { get; set; }
	}
}
