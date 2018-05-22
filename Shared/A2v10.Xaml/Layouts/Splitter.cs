// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Xaml
{

	public class Splitter : Container
	{
		public Orientation Orientation { get; set; }
		public Length Height { get; set; }
		public Length MinWidth { get; set; }

		#region Attached Properties
		static Lazy<IDictionary<Object, GridLength>> _attachedWidths = new Lazy<IDictionary<Object, GridLength>>(() => new Dictionary<Object, GridLength>());
		static Lazy<IDictionary<Object, Length>> _attachedMinWidths = new Lazy<IDictionary<Object, Length>>(() => new Dictionary<Object, Length>());

		public static void SetWidth(Object obj, GridLength width)
		{
			AttachedHelpers.SetAttached(_attachedWidths, obj, width);
		}

		public static GridLength GetWidth(Object obj)
		{
			return AttachedHelpers.GetAttached(_attachedWidths, obj);
		}

		public static void SetMinWidth(Object obj, Length width)
		{
			AttachedHelpers.SetAttached(_attachedMinWidths, obj, width);
		}

		public static Length GetMinWidth(Object obj)
		{
			return AttachedHelpers.GetAttached(_attachedMinWidths, obj);
		}

		internal static void CheckAttachedObjects()
		{
			var splType = typeof(Splitter);
			AttachedHelpers.CheckParentAttached(_attachedWidths, splType);
			AttachedHelpers.CheckParentAttached(_attachedMinWidths, splType);
		}

		internal static void ClearAttachedObjects()
		{
			if (_attachedWidths.IsValueCreated) _attachedWidths.Value.Clear();
			if (_attachedMinWidths.IsValueCreated) _attachedMinWidths.Value.Clear();
		}

#if DEBUG
		internal static void DebugCheckAttached()
		{
			if (_attachedWidths.IsValueCreated && _attachedWidths.Value.Count > 0 ||
				_attachedMinWidths.IsValueCreated && _attachedMinWidths.Value.Count > 0)
				throw new XamlException("Splitter. Invalid attached state");
		}
#endif

		#endregion

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			/* TODO: 
             * 1. Horizontal splitter
             * 2. Ширина колонок
            */
			var spl = new TagBuilder("div", "splitter");
			onRender?.Invoke(spl);
			MergeAttributes(spl, context);
			if (Height != null)
				spl.MergeStyle("height", Height.Value);
			if (MinWidth != null)
				spl.MergeStyle("min-width", MinWidth.Value);
			spl.AddCssClass(Orientation.ToString().ToLowerInvariant());
			// width
			GridLength p1w = GetWidth(Children[0]) ?? GridLength.Fr1();
			GridLength p2w = GetWidth(Children[1]) ?? GridLength.Fr1();

			Length p1mw = GetMinWidth(Children[0]);
			if (p1mw != null && !p1mw.IsPixel)
				throw new XamlException("Splitter.MinWidth must be specified in pixels");

			String rowsCols = Orientation == Orientation.Vertical ? "grid-template-columns" : "grid-template-rows";
			spl.MergeStyle(rowsCols, $"{p1w} 6px {p2w}");

			spl.RenderStart(context);

			// first part
			var p1 = new TagBuilder("div", "spl-part");
			p1.RenderStart(context);
			Children[0].RenderElement(context);
			p1.RenderEnd(context);

			new TagBuilder("div", "spl-handle")
				.MergeAttribute(Orientation == Orientation.Vertical ? "v-resize" : "h-resize", String.Empty)
				.MergeAttribute("data-min-width", GetMinWidth(Children[0])?.Value.ToString())
				.MergeAttribute("second-min-width", GetMinWidth(Children[1])?.Value.ToString())
				.Render(context);

			// second part
			var p2 = new TagBuilder("div", "spl-part");
			p2.RenderStart(context);
			Children[1].RenderElement(context);
			p2.RenderEnd(context);

			// drag-handle
			new TagBuilder("div", "drag-handle")
				.Render(context);

			spl.RenderEnd(context);
		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
			if (Children.Count != 2)
				throw new XamlException("The splitter must have two panels");
			if (Orientation == Orientation.Horizontal)
				throw new XamlException("The horizontal splitter is not yet supported");
		}

		internal override void OnDispose()
		{
			base.OnDispose();
			foreach (var c in Children)
			{
				AttachedHelpers.RemoveAttached(_attachedWidths, c);
				AttachedHelpers.RemoveAttached(_attachedMinWidths, c);
			}
		}
	}
}
