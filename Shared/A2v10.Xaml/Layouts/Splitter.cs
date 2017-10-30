// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Xaml
{

    public class Splitter : Container
    {
        public Orientation Orientation { get; set; }


        #region Attached Properties
        static Lazy<IDictionary<Object, GridLength>> _attachedWidths = new Lazy<IDictionary<Object, GridLength>>(() => new Dictionary<Object, GridLength>());

        public static void SetWidth(Object obj, GridLength width)
        {
            AttachedHelpers.SetAttached(_attachedWidths, obj, width);
        }

        public static GridLength GetWidth(Object obj)
        {
            return AttachedHelpers.GetAttached(_attachedWidths, obj);
        }
        #endregion

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            /* TODO: 
             * 1. Horizontal splitter
             * 2. Ширина колонок
            */
            var spl = new TagBuilder("div", "splitter");
            if (onRender != null)
                onRender(spl);
            MergeAttributes(spl, context);
            spl.AddCssClass(Orientation.ToString().ToLowerInvariant());
            // width
            GridLength p1w = GetWidth(Children[0]) ?? GridLength.Fr1();
            GridLength p2w = GetWidth(Children[1]) ?? GridLength.Fr1();

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
                .Render(context);

            // second part
            var p2 = new TagBuilder("div", "spl-part");
            p2.RenderStart(context);
            Children[1].RenderElement(context);
            p2.RenderEnd(context);

            // drag-handle
            new TagBuilder("div", "drag-handle").Render(context);

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
    }
}
