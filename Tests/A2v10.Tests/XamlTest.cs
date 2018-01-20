using System;
using System.IO;

using Microsoft.VisualStudio.TestTools.UnitTesting;

using A2v10.Infrastructure;
using A2v10.Tests.Config;
using A2v10.Xaml;

namespace A2v10.Tests
{
    [TestClass]
    [TestCategory("Xaml")]
    public class XamlTest
    {

        IRenderer _renderer;
        public XamlTest()
        {
            TestConfig.Start();
            _renderer = ServiceLocator.Current.GetService<IRenderer>();
        }

        [TestMethod]
        public void SimpleRender()
        {
            var ri = new RenderInfo();
            ri.RootId = Guid.NewGuid().ToString();
            using (var sv = new StringWriter())
            {
                ri.Writer = sv;
                Assert.ThrowsException<XamlException>(() => _renderer.Render(ri));
            }
        }

        String Render(String text)
        {
            var ri = new RenderInfo();
            ri.RootId = Guid.NewGuid().ToString();
            using (var sv = new StringWriter())
            {
                ri.Writer = sv;
                _renderer.Render(ri);
                return sv.ToString();
            }
        }
    }
}
