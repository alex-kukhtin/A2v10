using System;
using System.IO;

using Microsoft.VisualStudio.TestTools.UnitTesting;

using A2v10.Infrastructure;
using A2v10.Tests.Config;
using A2v10.Xaml;

namespace A2v10.Tests.Xaml;

[TestClass]
[TestCategory("Xaml")]
public class XamlTest
{

	readonly IRenderer _renderer;
	public XamlTest()
	{
		TestConfig.Start();
		_renderer = ServiceLocator.Current.GetService<IRenderer>();
	}

	[TestMethod]
	public void SimpleRender()
	{
		var ri = new RenderInfo
		{
			RootId = Guid.NewGuid().ToString()
		};
		using (var sv = new StringWriter())
		{
			ri.Writer = sv;
			Assert.ThrowsExactly<XamlException>(() => _renderer.Render(ri));
		}
	}

	String Render(String text)
	{
		var ri = new RenderInfo
		{
			RootId = Guid.NewGuid().ToString()
		};
		using (var sv = new StringWriter())
		{
			ri.Writer = sv;
			_renderer.Render(ri);
			return sv.ToString();
		}
	}
	[TestMethod]
	public void LengthUnits()
	{
		var l = Length.FromString("100px");
		Assert.IsTrue(l.Value == "100px");
		l = Length.FromString("100");
		Assert.IsTrue(l.Value == "100px");
		l = Length.FromString("10vh");
		Assert.IsTrue(l.Value == "10vh");
		l = Length.FromString("10vw");
		Assert.IsTrue(l.Value == "10vw");
		l = Length.FromString("50%");
		Assert.IsTrue(l.Value == "50%");
		l = Length.FromString("5em");
		Assert.IsTrue(l.Value == "5em");
		l = Length.FromString("10rem");
		Assert.IsTrue(l.Value == "10rem");
		l = Length.FromString("6em");
		Assert.IsTrue(l.Value == "6em");
		Assert.ThrowsExactly<XamlException>(() => Length.FromString("1fr"));
	}
}
