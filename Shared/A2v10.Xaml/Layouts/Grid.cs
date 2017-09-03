using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
	public class Grid : Container
	{

        #region Attached Properties
        static Lazy<IDictionary<Object, Int32>> _attachedColumn = new Lazy<IDictionary<Object, Int32>>(()=> new Dictionary<Object, Int32>());
        static Lazy<IDictionary<Object, Int32>> _attachedRow = new Lazy<IDictionary<Object, Int32>>(() => new Dictionary<Object, Int32>());
        static Lazy<IDictionary<Object, Int32>> _attachedColSpan = new Lazy<IDictionary<Object, Int32>>(() => new Dictionary<Object, Int32>());
        static Lazy<IDictionary<Object, Int32>> _attachedRowSpan = new Lazy<IDictionary<Object, Int32>>(() => new Dictionary<Object, Int32>());


        public static void SetCol(Object obj, Int32 col)
        {
            AttachedHelpers.SetAttached(_attachedColumn, obj, col);
        }

        public static Int32? GetCol(Object obj)
        {
            return AttachedHelpers.GetAttached(_attachedColumn, obj);
        }

        public static void SetRow(Object obj, Int32 row)
        {
            AttachedHelpers.SetAttached(_attachedRow, obj, row);
        }

        public static Int32? GetRow(Object obj)
        {
            return AttachedHelpers.GetAttached(_attachedRow, obj);
        }

        public static void SetColSpan(Object obj, Int32 span)
        {
            AttachedHelpers.SetAttached(_attachedColSpan, obj, span);
        }

        public static Int32? GetColSpan(Object obj)
        {
            return AttachedHelpers.GetAttached(_attachedColSpan, obj);
        }

        public static void SetRowSpan(Object obj, Int32 span)
        {
            AttachedHelpers.SetAttached(_attachedRowSpan, obj, span);
        }

        public static Int32? GetRowSpan(Object obj)
        {
            return AttachedHelpers.GetAttached(_attachedRowSpan, obj);
        }

        #endregion

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var grid = new TagBuilder("div", "grid", IsInGrid);
            if (onRender != null)
                onRender(grid);
            // TODO: row/col definitions
            grid.RenderStart(context);
            RenderChildren(context);
            grid.RenderEnd(context);
        }

        internal override void RenderChildren(RenderContext context)
        {
            foreach (var ch in Children)
            {
                ch.IsInGrid = true;
                using (context.GridContext(GetRow(ch), GetCol(ch), GetRowSpan(ch), GetColSpan(ch)))
                {
                    ch.RenderElement(context);
                }
            }
        }
    }
}
