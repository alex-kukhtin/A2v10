// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;
using System.Xaml;

namespace A2v10.Xaml
{
    public class StaticResource : MarkupExtension
    {
        public string Member { get; set; }

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
            IRootObjectProvider iRoot = serviceProvider.GetService(typeof(IRootObjectProvider)) as IRootObjectProvider;
            if (iRoot == null)
                throw new InvalidOperationException("StaticResource.ProvideValue. IRootObjectProvider is null");
            var root = iRoot.RootObject as RootContainer;
            if (root == null)
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
