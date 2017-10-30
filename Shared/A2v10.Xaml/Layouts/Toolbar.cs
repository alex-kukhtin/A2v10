// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{

    public enum ToolbarStyle
    {
        Default,
        Transparent
    }

    public class Toolbar : Container
    {

        public enum ToolbarAlign
        {
            Left,
            Right
        }

        #region Attached Properties
        static Lazy<IDictionary<Object, ToolbarAlign>> _attachedPart = new Lazy<IDictionary<Object, ToolbarAlign>>(() => new Dictionary<Object, ToolbarAlign>());

        public static void SetAlign(Object obj, ToolbarAlign aln)
        {
            AttachedHelpers.SetAttached(_attachedPart, obj, aln);
        }

        public static ToolbarAlign GetAlgin(Object obj)
        {
            return AttachedHelpers.GetAttached(_attachedPart, obj);
        }
        #endregion

        public ToolbarStyle Style { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var tb = new TagBuilder("div", "toolbar");
            if (onRender != null)
                onRender(tb);
            if (Style != ToolbarStyle.Default)
                tb.AddCssClass(Style.ToString().ToKebabCase());
            MergeAttributes(tb, context);
            tb.RenderStart(context);
            RenderChildren(context);
            tb.RenderEnd(context);
        }

        internal override void RenderChildren(RenderContext context)
        {
            if (_attachedPart == null)
            {
                base.RenderChildren(context);
                return;
            }
            List<UIElementBase> rightList = new List<UIElementBase>();
            // Те, что влево и не установлены
            foreach (var ch in Children)
            {
                if (GetAlgin(ch) == ToolbarAlign.Right)
                    rightList.Add(ch);
                else
                    ch.RenderElement(context);
            }
            if (rightList.Count == 0)
                return;
            // aligner
            new TagBuilder("div", "aligner").Render(context);

            // Те, что справа
            foreach (var ch in rightList)
                ch.RenderElement(context);
        }
    }
}
