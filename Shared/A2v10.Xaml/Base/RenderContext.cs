
using System.IO;


namespace A2v10.Xaml
{
	internal class RenderContext
	{
		public TextWriter Writer { get; private set; }

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
