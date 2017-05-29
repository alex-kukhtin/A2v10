using System;
using System.ComponentModel;

namespace A2v10.Xaml
{
	public class XamlElement : ISupportInitialize
	{
		internal XamlElement Parent { get; private set; }

		protected virtual void OnEndInit()
		{
		}

		internal void SetParent(XamlElement parent)
		{
			Parent = parent;
		}

		#region ISupportInitialize
		public void BeginInit()
		{
			// do nothing
		}

		public void EndInit()
		{
			OnEndInit();
		}
		#endregion
	}
}
