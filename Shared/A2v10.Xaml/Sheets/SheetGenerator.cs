
using System;
using System.Collections.Generic;
using System.Dynamic;

namespace A2v10.Xaml
{
	internal class SheetGenerator
	{
		private readonly RenderContext _context;

		public SheetGenerator(RenderContext context)
		{

			_context = context;
		}

		public void Build(String property)
		{
			if (String.IsNullOrEmpty(property))
				return;
			var dm = _context.DataModel;
			if (dm == null)
				return;
			var coll = dm.Eval<List<ExpandoObject>>(property);
			var md = dm.Metadata[property];
			_context.Writer.WriteLine(md.ToString());
		}
	}
}
