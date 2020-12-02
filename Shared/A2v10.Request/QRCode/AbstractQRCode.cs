
namespace A2v10.Request.QRCode
{
	// from https://github.com/codebude/QRCoder
	public abstract class AbstractQRCode<T>
	{
		protected QRCodeData qrCodeData;

		protected AbstractQRCode(QRCodeData data)
		{
			qrCodeData = data;
		}

		public abstract T GetGraphic(int pixelsPerModule);
	}
}
