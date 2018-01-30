// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Xaml;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{
    public class XamlRenderer : IRenderer
    {
        IProfiler _profile;
        public XamlRenderer(IProfiler profile)
        {
            _profile = profile;
        }

        public void Render(RenderInfo info)
        {
            if (String.IsNullOrEmpty(info.FileName))
                throw new XamlException("No source for render");
            IProfileRequest request = _profile.CurrentRequest;
            String fileName = String.Empty;
            UIElementBase uiElem = null;
            using (request.Start(ProfileAction.Render, $"load: {info.FileTitle}"))
            {
                // XamlServices.Load sets IUriContext
                if (!String.IsNullOrEmpty(info.FileName))
                    uiElem = XamlServices.Load(info.FileName) as UIElementBase;
                else if (!String.IsNullOrEmpty(info.Text))
                    uiElem = XamlServices.Parse(info.Text) as UIElementBase;
                else
                    throw new XamlException("Xaml. There must be either a 'FileName' or a 'Text' property");
                if (uiElem == null)
                    throw new XamlException("Xaml. Root is not 'UIElement'");
            }

            using (request.Start(ProfileAction.Render, $"render: {info.FileTitle}")) {
                RenderContext ctx = new RenderContext(uiElem, info);
                ctx.RootId = info.RootId;
                uiElem.RenderElement(ctx);
            }
        }
    }
}
