// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.IO;

namespace A2v10.Xaml
{
	public struct GridRowCol
	{
		private Int32? _row;
		private Int32? _col;
		private Int32? _rowSpan;
		private Int32? _colSpan;
		private AlignItem? _vAlign;

		public GridRowCol(Int32? row, Int32? col, Int32? rowSpan, Int32? colSpan, AlignItem? vAlign)
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
			String row = null;
			String col = null;
			if (_row != null && _row.Value != 0)
				row = _row.Value.ToString();
			if (_rowSpan != null && _rowSpan.Value != 0)
			{
				if (row == null)
					row = $"span {_rowSpan.Value}";
				else
					row += $" / span {_rowSpan.Value}";
			}
			if (row != null)
				rv.Add(new StringKeyValuePair() { Key = "grid-row", Value = row });

			if (_col != null && _col.Value != 0)
				col = _col.Value.ToString();
			if (_colSpan != null && _colSpan.Value != 0)
			{
				if (col == null)
					col = $"span {_colSpan.Value}";
				else
					col += $"/ span {_colSpan.Value}";
			}
			if (col != null)
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

	public sealed class GridContext : IDisposable
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



	internal class ScopeContext : IDisposable
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

	public class RenderContext
	{
		public String RootId { get; set; }
		public String Path { get; set; }

		public TextWriter Writer { get; private set; }

		public Boolean IsDebugConfiguration { get; }

		private Stack<GridRowCol> _stackGrid = new Stack<GridRowCol>();
		private Stack<ScopeElem> _stackScope = new Stack<ScopeElem>();

		readonly private UIElementBase _root;
		private IDataModel _dataModel;
		private ILocalizer _localizer;

		readonly private String _currentLocale;

		[ThreadStatic]
		public static String _partialDataContext;

		public static void SetPartialContext(String ctx)
		{
			_partialDataContext = ctx;
		}

		public RenderContext(UIElementBase root, RenderInfo ri)
		{
			Writer = ri.Writer;
			_root = root;
			_dataModel = ri.DataModel;
			_localizer = ri.Localizer;
			_currentLocale = ri.CurrentLocale;
			IsDebugConfiguration = ri.IsDebugConfiguration;
		}

		public Boolean IsDialog => _root is Dialog;
		public Boolean IsWizard => _root is Wizard;

		public Boolean IsDataModelIsReadOnly
		{
			get
			{
				if (_dataModel != null)
					return _dataModel.IsReadOnly;
				return false;
			}
		}

		public Object CalcDataModelExpression(String expression)
		{
			if (_dataModel == null)
				return null;
			return _dataModel.CalcExpression<Object>(expression);
		}

		public void RenderSpace()
		{
			Writer.Write(" ");
		}

		public void RenderNbSpace()
		{
			Writer.Write("&#xa;");
		}

		public GridContext GridContext(Int32? row, Int32? col, Int32? rowSpan, Int32? colSpan, AlignItem? vAlign)
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
			// check for invert
			if (path == null)
				path = String.Empty;
			if (path.StartsWith("!"))
				return "!" + GetNormalizedPathInternal(path.Substring(1));
			return GetNormalizedPathInternal(path);
		}

		private String GetNormalizedPathInternal(String path)
		{
			if (path == null)
				throw new ArgumentNullException(nameof(path));
			const String rootKey = "Root.";
			const String contextKey = "Context.";
			if (_stackScope.Count == 0)
			{
				if (path == "Root")
					return "$data";
				return path.Replace(rootKey, "$data.");
			}
			if (path.StartsWith("Parent."))
				return path;
			if (path.StartsWith(rootKey))
				return "$data." + path.Substring(rootKey.Length);
			else if (path.StartsWith(contextKey))
			{
				if (_partialDataContext == null)
					throw new XamlException($"There is no context for '{Path}' path");
				return path.Replace(contextKey, _partialDataContext);
			}
			ScopeElem scope = _stackScope.Peek();
			String result = scope.Scope;
			if (!String.IsNullOrEmpty(path))
				result += "." + path;
			if (scope.Replace != null)
				return scope.Replace(result);
			return result;
		}

		internal String GetEmptyPath()
		{
			if (_stackScope.Count == 0)
				return null;
			ScopeElem scope = _stackScope.Peek();
			String result = scope.Scope;
			if (scope.Replace != null)
				return scope.Replace(result);
			return result;
		}

		public String Localize(String text, Boolean replaceNewLine = true)
		{
			if (_localizer == null)
				return text;
			return _localizer.Localize(_currentLocale, text, replaceNewLine);
		}

	}
}
