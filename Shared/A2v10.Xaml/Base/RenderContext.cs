
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace A2v10.Xaml
{
    internal struct GridRowCol
    {
        internal Int32? _row;
        internal Int32? _col;

        public GridRowCol(Int32? row, Int32? col)
        {
            _row = row;
            _col = col;
        }

        public IList<StringKeyValuePair> GetGridAttributes()
        {
            if (_row == null && _col == null)
                return null;
            var rv = new List<StringKeyValuePair>();
            if (_row != null)
                rv.Add(new StringKeyValuePair() { Key = "grid-row", Value = _row.Value.ToString() });
            if (_col != null)
                rv.Add(new StringKeyValuePair() { Key = "grid-column", Value = _col.Value.ToString() });
            return rv;
        }
    }

    internal class GridContext : IDisposable
    {
        RenderContext _renderContext;

        public GridContext(RenderContext renderContext, GridRowCol rowCol)
        {
            _renderContext = renderContext;
            _renderContext.PushRowCol(rowCol);
        }

        public void Dispose()
        {
            _renderContext.PopRowCol();
        }
    }

	internal class RenderContext
	{
        public String RootId { get; set; }
		public TextWriter Writer { get; private set; }

        private Stack<GridRowCol> _stack = new Stack<GridRowCol>();

        public RenderContext(TextWriter writer)
        {
            Writer = writer;
        }

        public void RenderSpace()
		{
			Writer.Write(" ");
		}

		public void RenderNbSpace()
		{
			Writer.Write("&#xa;");
		}

        public GridContext GridContext(Int32? row, Int32? col)
        {
            var rowCol = new GridRowCol(row, col);
            return new GridContext(this, rowCol);
        }

        internal void PushRowCol(GridRowCol rowCol)
        {
            _stack.Push(rowCol);
        }

        internal void PopRowCol()
        {
            _stack.Pop();
        }

        public IEnumerable<StringKeyValuePair> GetGridAttributes()
        {
            if (_stack.Count == 0)
                return null;
            GridRowCol rowCol = _stack.Peek();
            return rowCol.GetGridAttributes();
        }
	}
}
