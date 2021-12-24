// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Linq;
using System.Collections.Generic;
using System.IO;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

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
				if (vAlign == "stretch")
					rv.Add(new StringKeyValuePair() { Key = "overflow", Value = "auto" });
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



	public sealed class ScopeContext : IDisposable
	{
		RenderContext _renderContext;
		public ScopeContext(RenderContext context, String scope, String path, Func<String, String> replace = null)
		{
			_renderContext = context;
			_renderContext.PushScope(scope, path, replace);
		}

		public void Dispose()
		{
			_renderContext.PopScope();
		}
	}

	internal struct ScopeElem
	{
		public readonly String Scope;
		public readonly String Path;
		public readonly Func<String, String> Replace;

		public ScopeElem(String scope, String path, Func<String, String> replace)
		{
			Scope = scope;
			Path = path;
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

		readonly private IXamlElement _root;
		private readonly IDataModel _dataModel;
		private readonly ILocalizer _localizer;
		private readonly ITypeChecker _typeChecker;

		readonly private String _currentLocale;

		public RenderContext(IXamlElement root, RenderInfo ri)
		{
			Writer = ri.Writer;
			_root = root;
			_dataModel = ri.DataModel;
			_localizer = ri.Localizer;
			_currentLocale = ri.CurrentLocale;
			_typeChecker = ri.TypeChecker;
			IsDebugConfiguration = ri.IsDebugConfiguration;
		}

		public Boolean IsDialog => _root is Dialog;
		public Boolean IsWizard => _root is Wizard;


		public IDataModel DataModel => _dataModel;

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

		internal void PushScope(String scope, String path, Func<String, String> replace)
		{
			_stackScope.Push(new ScopeElem(scope, path, replace));
		}

		internal Int32 ScopeLevel => _stackScope.Count;

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

		internal String GetNormalizedPath(String path, Boolean isWrapped = false)
		{
			// check for invert
			if (path == null)
				path = String.Empty;
			if (path.StartsWith("!"))
				return "!" + GetNormalizedPathInternal(path.Substring(1));

			if (_typeChecker != null)
				_typeChecker.CheckXamlExpression(GetExpressionForChecker(path));

			return GetNormalizedPathInternal(path, isWrapped);
		}

		internal String GetTypedNormalizedPath(String path, TypeCheckerTypeCode typeCode, Boolean isWrapped = false)
		{
			// check for invert
			if (path == null)
				path = String.Empty;
			if (path.StartsWith("!"))
				return "!" + GetNormalizedPathInternal(path.Substring(1));

			if (_typeChecker != null && typeCode != TypeCheckerTypeCode.Skip)
				_typeChecker.CheckTypedXamlExpression(GetExpressionForChecker(path), typeCode);

			return GetNormalizedPathInternal(path, isWrapped);
		}

		private String GetNormalizedPathInternal(String path, Boolean isWrapped = false)
		{
			if (path == null)
				throw new ArgumentNullException(nameof(path));

			const String rootKey = "Root.";
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
			ScopeElem scope = _stackScope.Peek();
			String result = scope.Scope;
			if (!String.IsNullOrEmpty(path))
			{
				if (isWrapped)
					result += $"['{path.Replace("'", "\\'")}']";
				else
					result += "." + path;
			}
			if (scope.Replace != null)
				return scope.Replace(result);
			return result;
		}

		String GetExpressionForChecker(String path)
		{
			if (_stackScope.Count == 0)
				return path;
			var parent = String.Join(".", _stackScope.Select(x => x.Path).Reverse().ToArray());
			if (String.IsNullOrEmpty(path))
				return parent;
			return $"{parent}.{path}";
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

		public String LocalizeCheckApostrophe(String text)
		{
			var txt = Localize(text);
			if (txt == null) return null;
			return txt.Replace("\\'", "'");
		}
	}
}
