// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.IO;

namespace A2v10.Xaml
{
    internal struct GridRowCol
    {
        private Int32? _row;
        private Int32? _col;
        private Int32? _rowSpan;
        private Int32? _colSpan;
        private VerticalAlign? _vAlign;

        public GridRowCol(Int32? row, Int32? col, Int32? rowSpan, Int32? colSpan, VerticalAlign? vAlign)
        {
            _row = row;
            _col = col;
            _rowSpan = rowSpan;
            _colSpan = colSpan;
            _vAlign = vAlign;
        }

        public IList<StringKeyValuePair> GetGridAttributes()
        {
            var rv = new List<StringKeyValuePair>();
            String row = "1";
            String col = "1";
            if (_row != null && _row.Value != 0)
                row = _row.Value.ToString();
            if (_rowSpan != null && _rowSpan.Value != 0)
                row += " / span " + _rowSpan.Value.ToString();
            rv.Add(new StringKeyValuePair() { Key = "grid-row", Value = row });
            if (_col != null && _col.Value != 0)
                col = _col.Value.ToString();
            if (_colSpan != null && _colSpan.Value != 0)
                col += " / span " + _colSpan.Value.ToString();
            rv.Add(new StringKeyValuePair() { Key = "grid-column", Value = col });
            if (_vAlign != null)
            {
                String vAlign = _vAlign.Value.AlignSelf();
                if (vAlign != null)
                    rv.Add(new StringKeyValuePair() { Key = "align-self", Value = vAlign });
            }
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



    internal class ScopeContext: IDisposable
    {
        RenderContext _renderContext;
        public ScopeContext(RenderContext context, String scope, Func<String, String> replace = null)
        {
            _renderContext = context;
            _renderContext.PushScope(scope, replace);
        }

        public void Dispose()
        {
            _renderContext.PopScope();
        }
    }

    internal struct ScopeElem
    {
        public String Scope;
        public Func<String, String> Replace;
        public ScopeElem(String scope, Func<String, String> replace)
        {
            Scope = scope;
            Replace = replace;
        }
    }

	internal class RenderContext
	{
        public String RootId { get; set; }
		public TextWriter Writer { get; private set; }

        private Stack<GridRowCol> _stackGrid = new Stack<GridRowCol>();
        private Stack<ScopeElem> _stackScope = new Stack<ScopeElem>();
        private UIElementBase _root;
        private IDataModel _dataModel;

        public RenderContext(TextWriter writer, UIElementBase root, IDataModel dataModel)
        {
            Writer = writer;
            _root = root;
            _dataModel = dataModel;
        }

        public Boolean IsDialog
        {
            get
            {
                return _root is Dialog;
            }
        }

        public Boolean IsDataModelIsReadOnly
        {
            get
            {
                if (_dataModel != null)
                    return _dataModel.IsReadOnly;
                return false;
            }
        }

        public void RenderSpace()
		{
			Writer.Write(" ");
		}

		public void RenderNbSpace()
		{
			Writer.Write("&#xa;");
		}

        public GridContext GridContext(Int32? row, Int32? col, Int32? rowSpan, Int32? colSpan, VerticalAlign? vAlign)
        {
            var rowCol = new GridRowCol(row, col, rowSpan, colSpan, vAlign);
            return new GridContext(this, rowCol);
        }

        internal void PushRowCol(GridRowCol rowCol)
        {
            _stackGrid.Push(rowCol);
        }

        internal void PopRowCol()
        {
            _stackGrid.Pop();
        }

        internal void PushScope(String scope, Func<String, String> replace)
        {
            _stackScope.Push(new ScopeElem(scope, replace));
        }

        internal void PopScope()
        {
            _stackScope.Pop();
        }

        public IEnumerable<StringKeyValuePair> GetGridAttributes()
        {
            if (_stackGrid.Count == 0)
                return null;
            GridRowCol rowCol = _stackGrid.Peek();
            return rowCol.GetGridAttributes();
        }

        internal String GetNormalizedPath(String path)
        {
            if (path == null)
                path = String.Empty;
            const String rootKey = "Root.";
            if (_stackScope.Count == 0)
                return path;
            if (path.StartsWith("Parent."))
                return path;
            if (path.StartsWith(rootKey))
                return path.Substring(rootKey.Length);
            ScopeElem scope = _stackScope.Peek();
            String result = scope.Scope;
            if (!String.IsNullOrEmpty(path))
                result += "." + path;
            if (scope.Replace != null)
                return scope.Replace(result);
            return result;
        }
	}
}
