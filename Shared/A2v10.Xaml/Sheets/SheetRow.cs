// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Windows.Markup;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public enum RowStyle
	{
		Default,
		Title,
		Parameter,
		LastParameter,
		Header,
		LightHeader,
		Footer,
		Total,
		NoBorder
	}

	[ContentProperty("Cells")]
	public class SheetRow : UIElement
	{
		public SheetCells Cells { get; } = new SheetCells();

		public RowStyle Style { get; set; }
		public TextAlign? Align { get; set; }

		public MarkStyle Mark { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var tr = new TagBuilder("tr");
			onRender?.Invoke(tr);
			MergeAttributes(tr, context);

			var markBind = GetBinding(nameof(Mark));
			if (markBind != null)
			{
				if (GetBinding(nameof(Bold)) != null)
					throw new XamlException("The Bold and Mark bindings cannot be used at the same time");
				tr.MergeAttribute(":class", markBind.GetPathFormat(context));
			}
			else if (Mark != MarkStyle.Default)
				tr.AddCssClass(Mark.ToString().ToKebabCase());

			if (Style != RowStyle.Default)
				tr.AddCssClass("row-" + Style.ToString().ToKebabCase());
			if (Align != null)
				tr.AddCssClass("text-" + Align.ToString().ToLowerInvariant());
			tr.RenderStart(context);
			foreach (var c in Cells)
				c.RenderElement(context);
			tr.RenderEnd(context);
		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
			foreach (var c in Cells)
				c.SetParent(this);
		}

		internal override void OnSetStyles()
		{
			base.OnSetStyles();
			foreach (var c in Cells)
				c.OnSetStyles();
		}
	}

	[TypeConverter(typeof(SheetRowsConverter))]
	public class SheetRows : List<SheetRow>
	{
	}

	public class SheetRowsConverter : TypeConverter
	{
		public override Boolean CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
		{
			if (sourceType == typeof(String))
				return true;
			return false;
		}

		public override Object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, Object value)
		{
			if (value == null)
				return null;
			if (value is String)
			{
				SheetRows rows = new SheetRows();
				SheetRow row = new SheetRow();
				rows.Add(row);
				foreach (var s in value.ToString().Split(','))
				{
					row.Cells.Add(new SheetCell() { Content = s.Trim() });
				}
				return rows;
			}
			throw new XamlException($"Invalid SheetRows value '{value}'");
		}
	}
}
