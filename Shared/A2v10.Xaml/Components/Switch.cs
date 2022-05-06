// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Children")]
	public class Case : XamlElement
	{
		public UIElementCollection Children { get; set; } = new UIElementCollection();
		public String Value { get; set; }

		public void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var parentGrid = FindParent<Grid>();
			if (parentGrid != null)
			{
				foreach (var c in Children)
				{
					c.IsInGrid = true;
					using (context.GridContext(c))
					{
						c.RenderElement(context);
					}
				}
			}
			else
			{
				foreach (var c in Children)
				{
					c.RenderElement(context);
				}
			}
		}

        public override void OnSetStyles()
        {
            base.OnSetStyles();
			foreach (var c in Children)
				c.OnSetStyles();
		}

        protected override void OnEndInit()
        {
            base.OnEndInit();
			foreach (var c in Children)
				c.SetParent(this);
		}

        public override void OnDispose()
        {
            base.OnDispose();
			foreach (var c in Children)
				c.OnDispose();
		}
	}

	public class Else : Case
	{
	}

	public class CaseCollection : List<Case>
	{
		public CaseCollection()
		{
		}
	}

	[ContentProperty("Cases")]
	public class Switch : UIElementBase
	{
		public Object Expression { get; set; }

		public CaseCollection Cases { get; set; } = new CaseCollection();

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var expr = GetBinding(nameof(Expression));
			if (expr == null)
				throw new XamlException("Binding 'Expression' must be a Bind");

			var cases = Cases.OrderBy(x => x is Else).ToList();

			for (var i=0; i<cases.Count; i++)
			{
				var itm = cases[i];
				var t = new TagBuilder("template", null);
				var ifKey = (i == 0) ? "v-if " : "v-else-if";
				if (itm is Else)
				{
					t.MergeAttribute("v-else", String.Empty);
				}
				else
				{
					// convert values to string!
					t.MergeAttribute(ifKey, $"('' + {expr.GetPathFormat(context)}) === '{itm.Value}'");
				}
				t.RenderStart(context);
				itm.RenderElement(context);
				t.RenderEnd(context);
			}
		}

        public override void OnSetStyles()
        {
            base.OnSetStyles();
			foreach (var c in Cases)
				c.OnSetStyles();
        }

        protected override void OnEndInit()
        {
            base.OnEndInit();
			foreach (var c in Cases)
				c.SetParent(this);
		}

        public override void OnDispose()
        {
            base.OnDispose();
			foreach (var c in Cases)
				c.OnDispose();
		}
	}
}
