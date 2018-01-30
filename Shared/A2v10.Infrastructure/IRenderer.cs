// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.IO;

namespace A2v10.Infrastructure
{
    public class RenderInfo
    {
        public String RootId;
        public String FileName;
        public String FileTitle;
        public String Text;
        public TextWriter Writer;
        public IDataModel DataModel;
        public ILocalizer Localizer;
        public String CurrentLocale;
    }

    public interface IRenderer
    {
        void Render(RenderInfo info);
    }
}
