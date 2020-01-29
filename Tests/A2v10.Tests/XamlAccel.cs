using System;
using System.IO;

using Microsoft.VisualStudio.TestTools.UnitTesting;

using A2v10.Infrastructure;
using A2v10.Xaml;

namespace A2v10.Tests.Xaml.Accelerators
{
	[TestClass]
	[TestCategory("Xaml")]
	public class XamlAccel
	{

		public XamlAccel()
		{
		}

		[TestMethod]
		public void SimpleKeyCodes()
		{
			var a = new Accel()
			{
				Key = "A"
			};
			Assert.AreEqual("____:KeyA", a.GetKeyCode());
			a.Key = "Z";
			Assert.AreEqual("____:KeyZ", a.GetKeyCode());
			a.Key = "0";
			Assert.AreEqual("____:Digit0", a.GetKeyCode());
			a.Key = "9";
			Assert.AreEqual("____:Digit9", a.GetKeyCode());
		}

		[TestMethod]
		public void ArrowKeyCodes()
		{
			var a = new Accel()
			{
				Key = "Left"
			};
			Assert.AreEqual("____:ArrowLeft", a.GetKeyCode());
			a.Key = "Right";
			Assert.AreEqual("____:ArrowRight", a.GetKeyCode());
			a.Key = "Up";
			Assert.AreEqual("____:ArrowUp", a.GetKeyCode());
			a.Key = "Down";
			Assert.AreEqual("____:ArrowDown", a.GetKeyCode());
		}

		[TestMethod]
		public void FuncKeyCodes()
		{
			var a = new Accel()
			{
				Key = "F1"
			};
			Assert.AreEqual("____:F1", a.GetKeyCode());
			a.Key = "F12";
			Assert.AreEqual("____:F12", a.GetKeyCode());
			a.Key = "F3";
			Assert.AreEqual("____:F3", a.GetKeyCode());
		}

		[TestMethod]
		public void KeyWithModifiers()
		{
			var a = new Accel()
			{
				Key = "Ctrl + F1"
			};
			Assert.AreEqual("C___:F1", a.GetKeyCode());
			a.Key = "Alt+Down";
			Assert.AreEqual("_A__:ArrowDown", a.GetKeyCode());
			a.Key = "Shift + A";
			Assert.AreEqual("__S_:KeyA", a.GetKeyCode());
			a.Key = "Meta+Z";
			Assert.AreEqual("___M:KeyZ", a.GetKeyCode());
			a.Key = "Ctrl + Alt + F1";
			Assert.AreEqual("CA__:F1", a.GetKeyCode());
			a.Key = "Ctrl+Shift + Down";
			Assert.AreEqual("C_S_:ArrowDown", a.GetKeyCode());
		}
	}
}
