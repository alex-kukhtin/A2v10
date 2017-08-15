
using System;
using System.IO;


namespace A2v10.Xaml
{
	internal class RenderContext
	{
        public String RootId { get; set; }
		public TextWriter Writer { get; private set; }

        public RenderContext(TextWriter writer)
        {
            Writer = writer;
        }

        public void RenderSpace()
		{
			Writer.Write(" ");
		}

		public void RenderNbSpace()
		{
			Writer.Write("&#xa;");
		}
	}
}
