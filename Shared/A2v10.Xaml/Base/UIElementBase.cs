// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.


using System;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public abstract class UIElementBase : XamlElement
	{
		public Boolean? If { get; set; }
		public Boolean? Show { get; set; }
		public Boolean? Hide { get; set; }
		public RenderMode? Render { get; set; }

		internal Boolean IsInGrid { get; set; }

		public Thickness Margin { get; set; }
		public Thickness Padding { get; set; }
		public WrapMode Wrap { get; set; }
		public Thickness Absolute { get; set; }

		public StyleDescriptor XamlStyle { get; set; }

		public String Tip { get; set; }

		internal abstract void RenderElement(RenderContext context, Action<TagBuilder> onRender = null);

		[Flags]
		public enum MergeAttrMode
		{
			Visibility = 0x01,
			Margin = 0x02,
			Wrap = 0x04,
			Tip = 0x08,
			Content = 0x10,
			TabIndex = 0x20,
			All = Visibility | Margin | Wrap | Tip | Content | TabIndex,
			NoContent = Visibility | Margin | Wrap | Tip | TabIndex,
			NoTabIndex = Visibility | Margin | Wrap | Tip | Content,
			SpecialTab = Visibility | Margin | Wrap | Tip,
			SpecialWizardPage = Margin | Wrap | Tip
		}

		internal virtual void MergeAttributes(TagBuilder tag, RenderContext context, MergeAttrMode mode = MergeAttrMode.All)
		{
			if (mode.HasFlag(MergeAttrMode.Visibility))
			{
				MergeBindingAttributeBool(tag, context, "v-if", nameof(If), If);
				MergeBindingAttributeBool(tag, context, "v-show", nameof(Show), Show);
				// emulate v-hide
				MergeBindingAttributeBool(tag, context, "v-show", nameof(Hide), Hide, bInvert: true);
			}
			if (mode.HasFlag(MergeAttrMode.Tip))
			{
				MergeBindingAttributeString(tag, context, "title", "Tip", Tip);
			}
			if (mode.HasFlag(MergeAttrMode.Wrap))
			{
				if (Wrap != WrapMode.Default)
					tag.AddCssClass(Wrap.ToString().ToKebabCase());
			}
			if (mode.HasFlag(MergeAttrMode.Margin))
			{
				if (Margin != null)
					Margin.MergeStyles("margin", tag);
				if (Padding != null)
					Padding.MergeStyles("padding", tag);

				if (Absolute != null)
					Absolute.MergeAbsolute(tag);
			}
		}

		internal void RenderContent(RenderContext context, Object content)
		{
			// if it's a binding, it will be added via MergeAttribute
			if (content == null)
				return;
			if (content is UIElementBase)
				(content as UIElementBase).RenderElement(context);
			else if (content != null)
				context.Writer.Write(context.Localize(content.ToString()));
		}

		internal Boolean RenderIcon(RenderContext context, Icon icon, String addClass = null)
		{
			var iconBind = GetBinding("Icon");
			if (icon == Icon.NoIcon && iconBind == null)
				return false;
			var iTag = new TagBuilder("i", "ico");
			if (iconBind != null)
				iTag.MergeAttribute(":class", $"'ico-' + {iconBind.GetPath(context)}");
			else if (icon != Icon.NoIcon)
				iTag.AddCssClass("ico-" + icon.ToString().ToKebabCase());
			iTag.AddCssClass(addClass);
			iTag.Render(context);
			context.RenderSpace(); // after icon - always
			return true;
		}

		internal void MergeBindingAttributeString(TagBuilder tag, RenderContext context, String attrName, String propName, String propValue)
		{
			var attrBind = GetBinding(propName);
			if (attrBind != null)
				tag.MergeAttribute($":{attrName}", attrBind.GetPathFormat(context));
			else
				tag.MergeAttribute(attrName, context.Localize(propValue));
		}

		internal void MergeAttributeInt32(TagBuilder tag, RenderContext context, String attrName, String propName, Int32? propValue)
		{
			var attrBind = GetBinding(propName);
			if (attrBind != null)
				tag.MergeAttribute($":{attrName}", attrBind.GetPath(context));
			else if (propValue != null)
				tag.MergeAttribute($":{attrName}", propValue.ToString());
		}

		internal void MergeCommandAttribute(TagBuilder tag, RenderContext context, Boolean withHref = true)
		{
			var cmd = GetBindingCommand("Command");
			if (cmd == null)
				return;
			cmd.MergeCommandAttributes(tag, context);
			tag.MergeAttribute("@click.prevent", cmd.GetCommand(context));
			if (withHref)
				tag.MergeAttribute(":href", cmd.GetHrefForCommand(context));
		}

		internal void MergeValueItemProp(TagBuilder input, RenderContext context, String valueName)
		{
			var valBind = GetBinding(valueName);
			if (valBind == null)
				return;
			// split to path and property
			String path = valBind.GetPath(context);
			(String Path, String Prop) = SplitToPathProp(path);
			if (String.IsNullOrEmpty(Path) || String.IsNullOrEmpty(Prop))
				throw new XamlException($"invalid binding for {valueName} '{path}'");
			input.MergeAttribute(":item", Path);
			input.MergeAttribute("prop", Prop);
			if (valBind.DataType != DataType.String)
				input.MergeAttribute("data-type", valBind.DataType.ToString());
			var maskBind = valBind.GetBinding("Mask");
			if (maskBind != null)
				input.MergeAttribute(":mask", maskBind.GetPathFormat(context));
			else if (!String.IsNullOrEmpty(valBind.Mask))
				input.MergeAttribute("mask", valBind.Mask);
			if (valBind.HideZeros)
				input.MergeAttribute(":hide-zeros", "true");
		}

		internal void MergeValidateValueItemProp(TagBuilder input, RenderContext context, String valueName)
		{
			var valBind = GetBinding(valueName);
			if (valBind == null)
				return;
			// split to path and property
			String path = valBind.GetPath(context);
			var (Path, Prop) = SplitToPathProp(path);
			if (String.IsNullOrEmpty(Path) || String.IsNullOrEmpty(Prop))
				throw new XamlException($"invalid binding for {valueName} '{path}'");
			input.MergeAttribute(":item-to-validate", Path);
			input.MergeAttribute("prop-to-validate", Prop);
		}

		internal (String Path, String Prop) SplitToPathProp(String path)
		{
			var result = (Path: "", Prop: "");
			String itemPath = String.Empty;
			String itemProp = String.Empty;
			if (String.IsNullOrEmpty(path))
				return result;
			Int32 ix = path.LastIndexOf('.');
			if (ix != -1)
			{
				result.Prop = path.Substring(ix + 1);
				result.Path = path.Substring(0, ix);
			}
			return result;
		}

		internal void RenderBadge(RenderContext context, String badge)
		{
			var badgeBind = GetBinding("Badge");
			if (badgeBind != null)
			{
				new TagBuilder("span", "badge")
					.MergeAttribute("v-text", badgeBind.GetPathFormat(context))
					.Render(context);
			}
			else if (!String.IsNullOrEmpty(badge))
			{
				new TagBuilder("span", "badge")
					.SetInnerText(context.Localize(badge))
					.Render(context);
			}
		}

		internal virtual void MergeAlign(TagBuilder input, RenderContext context, TextAlign align)
		{
			var alignProp = GetBinding("Align");
			if (alignProp != null)
				input.MergeAttribute(":align", alignProp.GetPath(context));
			else if (align != TextAlign.Default)
				input.MergeAttribute("align", align.ToString().ToLowerInvariant());
		}

		internal virtual Boolean SkipRender(RenderContext context)
		{
			var rm = GetRenderMode(context);
			if (rm == null)
				return false;
			if (rm == RenderMode.Hide)
				return true;
			if (rm == RenderMode.Debug)
				return context.IsDebugConfiguration ? false : true;
			return false;
		}

		internal RenderMode? GetRenderMode(RenderContext context)
		{
			var renderBind = GetBinding(nameof(Render));
			if (renderBind == null && Render == null)
				return null;
			if (renderBind != null)
			{
				var rm = context.CalcDataModelExpression(renderBind.Path);
				if (rm is String rmString)
				{
					if (Enum.TryParse<RenderMode>(rmString, out RenderMode rmResult))
					{
						return rmResult;
					}
					throw new XamlException($"Invalid RenderMode '{rmResult}', Expected 'Show', 'Hide', 'ReadOnly' or 'Debug'");
				}
				else if (rm is Boolean rmBool)
					return rmBool ? RenderMode.Show : RenderMode.Hide;
			}
			else if (Render != null)
			{
				return Render;
			}
			return null;
		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
		}

		internal override void OnSetStyles()
		{
			XamlStyle?.Set(this);
		}
	}
}
