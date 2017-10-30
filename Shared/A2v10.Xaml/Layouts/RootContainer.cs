// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.


using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    public abstract class RootContainer : Container, IUriContext
    {
        #region IUriContext
        public Uri BaseUri { get; set; }
        #endregion
    }
}
