// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Markup;

namespace A2v10.Xaml
{

	/*
    treeview.js options: {
        // property names
        title: String,
        icon: String,
        label: String,
        subitems: String,
        // options
        staticIcons: [String, String], //[Folder, Item]
        folderSelect: Boolean || Function,
        wrapLabel: Boolean,
        hasIcon: Boolean
    }
    */

	[ContentProperty("Label")]
	public class TreeViewItem : UIElement
	{
		public Object ItemsSource { get; set; }
		public Icon Icon { get; set; }
		public String Label { get; set; }
		public Boolean? IsFolder { get; set; }
		public Boolean? IsGroup { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			throw new NotImplementedException(nameof(RenderElement));
		}

		internal void AppendJsValues(StringBuilder sb, RenderContext context)
		{
			var isBind = GetBinding(nameof(ItemsSource));
			if (isBind != null)
				sb.Append($"subitems: '{isBind.GetTypedPath(context, TypeCheckerTypeCode.Skip)}',");
			var labelBind = GetBinding(nameof(Label));
			if (labelBind != null)
				sb.Append($"label: '{labelBind.GetTypedPath(context, TypeCheckerTypeCode.Skip)}',");
			var tipBind = GetBinding(nameof(Tip));
			if (tipBind != null)
				sb.Append($"title: '{tipBind.GetTypedPath(context, TypeCheckerTypeCode.Skip)}',");
			var iconBind = GetBinding(nameof(Icon));
			if (iconBind != null)
				sb.Append($"hasIcon: true, icon: '{iconBind.GetTypedPath(context, TypeCheckerTypeCode.Skip)}',");
			var isFolderBind = GetBinding(nameof(IsFolder));
			if (isFolderBind != null)
				sb.Append($"isFolder: '{isFolderBind.GetTypedPath(context, TypeCheckerTypeCode.Skip)}',");
			else if (IsFolder != null)
				throw new XamlException("The IsFolder property must be a binding");
			var isGroupBind = GetBinding(nameof(IsGroup));
			if (isGroupBind != null)
				sb.Append($"isGroup: '{isGroupBind.GetTypedPath(context, TypeCheckerTypeCode.Skip)}',");
			else if (IsGroup != null)
				throw new XamlException("The IsGroup property must be a binding");
		}
	}

	public class TreeViewItemCollection : List<TreeViewItem>
	{
	}

	public enum TreeViewStyle
	{
		Normal,
		SideBarMenu
	}

	[ContentProperty("Children")]
	public class TreeView : Control
	{
		public Object ItemsSource { get; set; }

		public Boolean FolderSelect { get; set; }
		public Boolean WrapLabel { get; set; }

		public Icon IconFolder { get; set; }
		public Icon IconItem { get; set; }

		public AutoSelectMode AutoSelect { get; set; }

		public Boolean ExpandFirstItem { get; set; }
		public Length Height { get; set; }

		public TreeViewStyle Style { get; set; }
		public Boolean? Indent { get; set; }
		public Command DoubleClick { get; set; }

		public TreeViewItemCollection Children { get; set; } = new TreeViewItemCollection();

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var cont = new TagBuilder("tree-view", null, IsInGrid);
			MergeAttributes(cont, context);

			if (Height != null)
				cont.MergeStyle("height", Height.Value);
			if (Style != TreeViewStyle.Normal)
				cont.AddCssClass($"tree-view-{Style.ToString().ToKebabCase()}");
			if (Indent != null && Indent.Value == false)
				cont.AddCssClass("no-indent");

			var isBind = GetBinding(nameof(ItemsSource));
			if (isBind != null)
			{
				cont.MergeAttribute(":items", isBind.GetPath(context));
				cont.MergeAttribute(":expand", "$expand"); // in BaseController
				if (Children.Count != 1)
					throw new XamlException("Only one TreeViewItem element is allowed for dynamic TreeView");
				var ch = Children[0];
				cont.MergeAttribute(":options", GetOptions(context, ch));
			}
			if (AutoSelect != AutoSelectMode.None)
				cont.MergeAttribute("auto-select", AutoSelect.ToString().ToKebabCase());
			if (ExpandFirstItem)
				cont.MergeAttribute(":expand-first-item", "true");

			var dblClickBind = GetBindingCommand(nameof(DoubleClick));
			if (dblClickBind != null)
			{
				// Function!
				cont.MergeAttribute(":doubleclick", "() => " + dblClickBind.GetCommand(context));
			}

			cont.RenderStart(context);
			cont.RenderEnd(context);
		}

		String GetOptions(RenderContext context, TreeViewItem childElem)
		{
			var sb = new StringBuilder("{");
			var fsBind = GetBinding(nameof(FolderSelect));
			if (fsBind != null)
				sb.Append($"folderSelect: {fsBind.GetPath(context)},");
			else if (FolderSelect)
				sb.Append("folderSelect: true,");
			var wlBind = GetBinding(nameof(WrapLabel));
			if (wlBind != null)
				sb.Append($"wrapLabel: {wlBind.GetPath(context)},");
			else if (WrapLabel)
				sb.Append("wrapLabel: true,");

			if (IconFolder != Icon.NoIcon && IconItem != Icon.NoIcon)
			{
				sb.Append("hasIcon: true,");
				sb.Append($"staticIcons: ['{IconFolder.ToString().ToKebabCase()}', '{IconItem.ToString().ToKebabCase()}'],");
			}

			childElem.AppendJsValues(sb, context);
			sb.RemoveTailComma(); // tail comma
			sb.Append("}");
			return sb.ToString();
		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
			if (IconFolder != Icon.NoIcon && IconItem == Icon.NoIcon)
				IconItem = Icon.Empty;
			else if (IconFolder == Icon.NoIcon && IconItem != Icon.NoIcon)
				IconFolder = Icon.Empty;
		}
	}
}
