﻿using A2v10.Web.Mvc.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Tests
{
    [TestClass]
    [TestCategory("Database")]
    public class RequestModelTest
    {
        [TestMethod]
        public void RequestModelInfo()
        {
            var mi = RequestModel.GetModelInfo(RequestUrlKind.Page, "home/index/0");
            Assert.AreEqual("index", mi.action);
            Assert.AreEqual("home", mi.path);

            mi = RequestModel.GetModelInfo(RequestUrlKind.Page, "top/side/edit/123");
            Assert.AreEqual("edit", mi.action);
            Assert.AreEqual("top/side", mi.path);
        }
    }
}