// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Xaml
{
    public class Sheet : UIElement
    {

        public List<SheetSection> Sections { get; set; } = new List<SheetSection>();

        SheetRows _header;
        SheetRows _footer;
        SheetColumnCollection _columns;
        public SheetRows Header
        {
            get
            {
                if (_header == null)
                    _header = new SheetRows();
                return _header;
            }
            set
            {
                _header = value;
            }
        }

        public SheetRows Footer
        {
            get
            {
                if (_footer == null)
                    _footer = new SheetRows();
                return _footer;
            }
            set
            {
                _footer = value;
            }
        }

        public SheetColumnCollection Columns
        {
            get
            {
                if (_columns == null)
                    _columns = new SheetColumnCollection();
                return _columns;
            }
            set
            {
                _columns = value;
            }
        }

        public GridLinesVisibility GridLines { get; set; }
        public Boolean Hover { get; set; }
        public Boolean Striped { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var sheet = new TagBuilder("table", "sheet", IsInGrid);
            if (onRender != null)
                onRender(sheet);
            MergeAttributes(sheet, context);
            if (GridLines != GridLinesVisibility.None)
                sheet.AddCssClass($"grid-{GridLines.ToString().ToLowerInvariant()}");
            sheet.AddCssClassBool(Hover, "hover");
            sheet.AddCssClassBool(Striped, "striped");
            sheet.RenderStart(context);
            RenderColumns(context);
            RenderHeader(context);
            RenderBody(context);
            RenderFooter(context);
            sheet.RenderEnd(context);
        }

        void RenderColumns(RenderContext context)
        {
            _columns?.Render(context);
        }

        void RenderHeader(RenderContext context)
        {
            if (_header == null)
                return;
            var thead = new TagBuilder("thead");
            thead.RenderStart(context);
            foreach (var h in Header)
                h.RenderElement(context);
            thead.RenderEnd(context);
        }

        void RenderBody(RenderContext context)
        {
            foreach (var s in Sections)
                s.RenderElement(context, null);
        }

        void RenderFooter(RenderContext context)
        {
            if (_footer == null)
                return;
            var tfoot = new TagBuilder("tfoot");
            tfoot.RenderStart(context);
            foreach (var f in Footer)
                f.RenderElement(context);
            tfoot.RenderEnd(context);
        }

        protected override void OnEndInit()
        {
            base.OnEndInit();
            if (_header != null)
                foreach (var h in Header)
                    h.SetParent(this);
            if (_footer != null)
                foreach (var f in Footer)
                    f.SetParent(this);
        }
    }
}
