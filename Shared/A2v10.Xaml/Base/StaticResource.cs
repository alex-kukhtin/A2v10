// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;
using System.Xaml;

namespace A2v10.Xaml
{
	public class StaticResource : MarkupExtension
	{
		public String Member { get; set; }

		public StaticResource()
		{
		}

		public StaticResource(String member)
		{
			Member = member;
		}

		public override Object ProvideValue(IServiceProvider serviceProvider)
		{
			IProvideValueTarget iTarget = serviceProvider.GetService(typeof(IProvideValueTarget)) as IProvideValueTarget;
			if (!(serviceProvider.GetService(typeof(IRootObjectProvider)) is IRootObjectProvider iRoot))
				throw new InvalidOperationException("StaticResource.ProvideValue. IRootObjectProvider is null");
			if (!(iRoot.RootObject is RootContainer root))
				return null;
			Object resrc = root.FindResource(Member);
			if (resrc == null)
			{
				throw new XamlException($"Resource '{Member}' not found");
			}
			return resrc;
		}
	}
}
