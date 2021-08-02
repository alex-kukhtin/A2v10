
using System;

namespace A2v10.Xaml.Bootstrap
{
	public class Container : BsContainer
	{
		public Boolean Fluid { get; set; }

		public override String ContainerClass => Fluid ? "container-fluid" : "container";

		protected override void OnEndInit()
		{
			base.OnEndInit();
			foreach (var c in Children)
				c.SetParent(this);
		}
	}
}
