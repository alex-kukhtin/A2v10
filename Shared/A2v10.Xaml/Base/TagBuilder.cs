// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace A2v10.Xaml
{
	internal enum TagRenderMode
	{
		Normal = 0,
		StartTag = 1,
		EndTag = 2,
		SelfClosing = 3
	}

	internal class TagBuilder
	{
		public String TagName { get; }
		public String InnerText { get; set; }

		Boolean _bRender = false;
		readonly Boolean _inGrid = false;

		public TagBuilder(String tagName = "div", String classes = null, Boolean inGrid = false)
		{
			TagName = tagName ?? "div";
			_inGrid = inGrid;
			if (!String.IsNullOrEmpty(classes))
				AddCssClass(classes);
		}

		internal void SetInnerText(Object p)
		{
			throw new NotImplementedException();
		}

		void CheckRendered()
		{
			if (_bRender)
				throw new InvalidOperationException($"The element <{TagName}> is already rendered!");
		}

		HashSet<String> _cssClasses = null;
		IDictionary<String, String> _attributes = null;
		IDictionary<String, String> _styles = null;

		public TagBuilder SetInnerText(String text)
		{
			CheckRendered();
			InnerText = text;
			return this;

		}

		public Boolean HasClass(String className)
		{
			if (_cssClasses == null)
				return false;
			if (className == null)
				return false;
			return _cssClasses.Contains(className);
		}

		public TagBuilder AddCssClassBool(Boolean bAdd, String value)
		{
			if (bAdd)
				return AddCssClass(value);
			return this;
		}

		public TagBuilder AddCssClassBool(Boolean? bAdd, String value)
		{
			if (bAdd.HasValue && bAdd.Value)
				return AddCssClass(value);
			return this;
		}

		public TagBuilder AddCssClassBoolNo(Boolean? bAdd, String value)
		{
			if (!bAdd.HasValue)
				return this;
			return AddCssClass(bAdd.Value ? value : "no-" + value);
		}

		public TagBuilder AddCssClass(String value)
		{
			if (String.IsNullOrEmpty(value))
				return this;
			CheckRendered();
			if (_cssClasses == null)
				_cssClasses = new HashSet<String>();
			_cssClasses.UnionWith(value.Split(' '));
			return this;
		}

		public TagBuilder MergeStyles(String styles)
		{
			if (String.IsNullOrEmpty(styles))
				return this;
			foreach (var st in styles.Split(';'))
			{
				var xst = st.Split(':');
				if (xst.Length == 2)
					MergeStyle(xst[0], xst[1]);
			}
			return this;
		}


		public TagBuilder MergeStyleUnit(String key, String value)
		{
			if (String.IsNullOrEmpty(value))
				return this;
			if (Char.IsDigit(value[value.Length - 1]))
				value = value + "px";
			return MergeStyle(key, value);
		}

		public TagBuilder MergeStyle(String key, String value)
		{
			CheckRendered();
			if (value == null)
				return this;
			if (_styles == null)
				_styles = new Dictionary<String, String>();
			if (!_styles.ContainsKey(key))
				_styles.Add(key, value);
			else
				_styles[key] = value;
			return this;
		}

		public TagBuilder MergeStyles(IEnumerable<StringKeyValuePair> pairs)
		{
			if (pairs == null)
				return this;
			foreach (var kvp in pairs)
				MergeStyle(kvp.Key, kvp.Value);
			return this;
		}

		public String GetAttribute(String key)
		{
			if (_attributes == null)
				return null;
			if (_attributes.TryGetValue(key, out String attr))
				return attr;
			return null;
		}
		public TagBuilder RemoveAttribute(String key)
		{
			if (_attributes == null)
				return this;
			if (_attributes.ContainsKey(key))
				_attributes.Remove(key);
			return this;
		}

		public TagBuilder MergeAttribute(String key, Int32? value, Boolean replaceExisting = false)
		{
			if (!value.HasValue)
				return this;
			return MergeAttribute(key, value.Value.ToString(), replaceExisting);
		}

		public TagBuilder MergeAttribute(String key, String value, Boolean replaceExisting = false)
		{
			CheckRendered();
			if (value == null)
				return this;
			if (_attributes == null)
				_attributes = new Dictionary<String, String>();
			if (!_attributes.ContainsKey(key))
			{
				_attributes.Add(key, value);
				return this;
			}
			if (replaceExisting)
			{
				_attributes[key] = value;
			}
			else
			{
				String val = _attributes[key];
				val += " " + value;
				_attributes[key] = val;
			}
			return this;
		}

		String GetCssClasses()
		{
			if (_cssClasses != null)
				return " class=\"" + String.Join(" ", _cssClasses.ToArray()) + "\"";
			return String.Empty;
		}

		public TagBuilder Render(RenderContext context, TagRenderMode mode = TagRenderMode.Normal, Boolean addSpace = false)
		{
			switch (mode)
			{
				case TagRenderMode.SelfClosing:
					context.Writer.Write(CreateStartTag(context, true));
					break;
				case TagRenderMode.StartTag:
					context.Writer.Write(CreateStartTag(context, false));
					break;
				case TagRenderMode.Normal:
					context.Writer.Write(CreateStartTag(context, false));
					context.Writer.Write(context.Localize(InnerText));
					context.Writer.Write($"</{TagName}>");
					break;
				case TagRenderMode.EndTag:
					context.Writer.Write($"</{TagName}>");
					break;
			}
			if (addSpace)
				context.Writer.WriteLine();
			_bRender = true;
			return this;
		}

		public TagBuilder RenderStart(RenderContext context)
		{
			return Render(context, TagRenderMode.StartTag);
		}

		public TagBuilder RenderEnd(RenderContext context, Boolean addSpace = false)
		{
			Render(context, TagRenderMode.EndTag);
			if (addSpace)
				context.Writer.WriteLine();
			return this;
		}

		String GetAttributes()
		{
			if (_attributes == null)
				return String.Empty;
			return " " + String.Join(" ",
				_attributes.Select(
					(item) =>
					{
						return String.IsNullOrEmpty(item.Value)
							? item.Key :
							$"{item.Key}=\"{item.Value}\"";
					}));
		}

		String GetStyles()
		{
			if (_styles == null)
				return String.Empty;
			return " style=\"" + String.Join(";",
				_styles.Select(
					(item) =>
					{
						return $"{item.Key}:{item.Value}";
					})) + "\"";
		}

		String CreateStartTag(RenderContext context, Boolean bSelfClosing)
		{
			var sb = new StringBuilder(255);
			this.MergeStyles(_inGrid ? context.GetGridAttributes() : null);
			sb.Append("<")
				.Append(TagName)
				.Append(GetCssClasses())
				.Append(GetAttributes())
				.Append(GetStyles())
				.Append(bSelfClosing ? "/>" : ">");
			return sb.ToString();
		}

		public static void RenderSpanText(RenderContext context, String cssClass, Bind binding, String value = null)
		{
			if (binding == null && value == null)
				return;
			var tag = new TagBuilder("span", cssClass);
			if (binding != null)
				tag.MergeAttribute("v-text", binding.GetPathFormat(context));
			tag.RenderStart(context);
			if (value != null)
				context.Writer.Write(value);
			tag.RenderEnd(context);
		}
	}
}
