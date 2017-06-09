using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	public class Bind : MarkupExtension
	{

		public String Path { get; set; }

		public Bind()
		{

		}
		public Bind(String path)
		{
			Path = path;
		}

		public override object ProvideValue(IServiceProvider serviceProvider)
		{
			IProvideValueTarget iTarget = serviceProvider.GetService(typeof(IProvideValueTarget)) as IProvideValueTarget;
			if (iTarget == null)
				return null;
			var targetObj = iTarget.TargetObject as XamlElement;
			var targetProp = iTarget.TargetProperty as PropertyInfo;
			if ((targetObj == null) && (targetProp == null))
				return null;
			targetObj.SetBinding(targetProp.Name, this);
			if (targetProp.PropertyType.IsValueType)
				return Activator.CreateInstance(targetProp.PropertyType);
			return null; // is object
		}
	}
}
