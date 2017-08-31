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
        static IDictionary<Object, Int32> _attachedColumn = new Dictionary<Object, Int32>();
        static IDictionary<Object, Int32> _attachedRow = new Dictionary<Object, Int32>();

        public static void SetColumn(Object obj, Int32 col)
        {
            if (_attachedColumn == null)
                _attachedColumn = new Dictionary<Object, Int32>();
            if (_attachedColumn.ContainsKey(obj))
                _attachedColumn[obj] = col;
            else
                _attachedColumn.Add(obj, col);
        }

        public static Int32? GetColumn(Object obj)
        {
            if (_attachedColumn != null)
            {
                Int32 column;
                if (_attachedColumn.TryGetValue(obj, out column))
                    return column;
            }
            return null;
        }

        public static void SetRow(Object obj, Int32 col)
        {
            if (_attachedRow == null)
                _attachedRow = new Dictionary<Object, Int32>();
            if (_attachedRow.ContainsKey(obj))
                _attachedRow[obj] = col;
            else
                _attachedRow.Add(obj, col);
        }

        public static Int32? GetRow(Object obj)
        {
            if (_attachedRow != null)
            {
                Int32 column;
                if (_attachedRow.TryGetValue(obj, out column))
                    return column;
            }
            return null;
        }
        #endregion

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var grid = new TagBuilder("div", "grid");
            if (onRender != null)
                onRender(grid);
            grid.RenderStart(context);
            RenderChildren(context);
            grid.RenderEnd(context);
        }

        internal override void RenderChildren(RenderContext context)
        {
            foreach (var ch in Children)
            {
                using (context.GridContext(GetRow(ch), GetColumn(ch)))
                {
                    ch.RenderElement(context);
                }
            }
        }
    }
}
