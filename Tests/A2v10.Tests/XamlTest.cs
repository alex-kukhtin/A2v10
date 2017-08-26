using A2v10.Infrastructure;
using A2v10.Tests.Config;
using A2v10.Xaml;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Tests
{
    [TestClass]
    [TestCategory("Xaml")]
    public class XamlTest
    {

        IRenderer _renderer;
        public XamlTest()
        {
            _renderer = TestConfig.Renderer.Value;
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
    }
}
