using System;
using System.IO;

namespace A2v10.Infrastructure
{
    public class RenderInfo
    {
        public String RootId;
        public String FileName;
        public TextWriter Writer;
    }

    public interface IRenderer
    {
        void Render(RenderInfo info);
    }
}
