using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Interop.ExportTo
{
	public enum RowRole {
		None,
		Title,
		Parameter,
		LastParameter,
		Header,
		LightHeader,
		Total,
		Body,
		Footer
	}

	public struct Style
	{
		public HorizontalAlign Align;
		public Boolean Bold;
		public DataType DataType;
		public Boolean Wrap;
		public RowRole RowRole;
		public RowKind RowKind;

		public Boolean HasBorder => RowKind == RowKind.tbody || RowRole == RowRole.Header || RowRole == RowRole.Footer || RowRole == RowRole.Total;
		public Boolean HasAlignment => Align != HorizontalAlign.NotSet || DataType == DataType.DateTime || DataType == DataType.Date;
	}

	public class StylesDictionary
	{
		Dictionary<Style, UInt32> _hash = new Dictionary<Style, UInt32>();
		public List<Style> List { get; }  = new List<Style>();

		public StylesDictionary()
		{
			var d = new Style();
			// default style (zero)
			GetOrCreate(d);
		}

		public UInt32 GetOrCreate(Style style)
		{
			if (_hash.TryGetValue(style, out UInt32 index))
				return index;
			List.Add(style);
			var newIndex = (UInt32) List.Count - 1;
			_hash.Add(style, newIndex);
			return newIndex;
		}
	}
}
