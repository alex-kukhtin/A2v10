// Copyright © 2020 Alex Kukhtin. All rights reserved.

using A2v10.Data.Interfaces;
using System;
using System.Collections.Generic;
using System.Dynamic;

namespace A2v10.Xaml
{
	public partial class Sheet
	{
		public void GenerateSheet(RenderContext context)
		{
			if (AutoGenerate == null)
				return;
			switch (AutoGenerate.Mode)
			{
				case SheetAutoGenerateMode.FromDataModel:
					GenerateFromDataModel(context, AutoGenerate.PropertyName);
					break;
			}
		}

		void GenerateFromDataModel(RenderContext context, String propertyName)
		{
			var dm = context.DataModel;
			if (dm == null)
				return;
			var coll = dm.Eval<List<ExpandoObject>>(propertyName);
			var rootMd = dm.Metadata["TRoot"];
			if (!rootMd.Fields.ContainsKey(propertyName))
				throw new XamlException($"Pproperty {propertyName} not found in the root of the data model");
			var fieldData = rootMd.Fields[propertyName];
			var fieldsMD = dm.Metadata[fieldData.RefObject];

			var header = new SheetRow() { Style = RowStyle.Header };
			var dataRow = new SheetRow();
			Header.Add(header);

			var dataSect = new SheetSection();
			dataSect.SetBinding(nameof(dataSect.ItemsSource), new Bind(propertyName));
			dataSect.Children.Add(dataRow);
			Sections.Add(dataSect);

			foreach (var field in fieldsMD.Fields)
			{
				header.Cells.Add(new SheetCell()
				{
					Content = field.Key
				});
				var cellBind = new Bind(field.Key);
				cellBind.SetWrapped();
				var cell = new SheetCell();
				cell.SetBinding(nameof(cell.Content), cellBind);
				switch (field.Value.SqlDataType)
				{
					case SqlDataType.DateTime:
						cellBind.DataType = DataType.DateTime;
						cell.Wrap = WrapMode.NoWrap;
						cell.Align = TextAlign.Center;
						break;
					case SqlDataType.Date:
						cellBind.DataType = DataType.Date;
						cell.Wrap = WrapMode.NoWrap;
						cell.Align = TextAlign.Center;
						break;
					case SqlDataType.Time:
						cellBind.DataType = DataType.Time;
						cell.Wrap = WrapMode.NoWrap;
						cell.Align = TextAlign.Center;
						break;
					case SqlDataType.Currency:
						cellBind.DataType = DataType.Currency;
						cell.Wrap = WrapMode.NoWrap;
						cell.Align = TextAlign.Right;
						break;
					case SqlDataType.Float:
					case SqlDataType.Decimal:
						cellBind.DataType = DataType.Number;
						cell.Wrap = WrapMode.NoWrap;
						cell.Align = TextAlign.Right;
						break;
					case SqlDataType.Int:
					case SqlDataType.Bigint:
						cell.Align = TextAlign.Right;
						cell.Wrap = WrapMode.NoWrap;
						break;
				}
				dataRow.Cells.Add(cell);
			}
		}
	}
}
