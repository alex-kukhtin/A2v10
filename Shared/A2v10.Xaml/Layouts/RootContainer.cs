
using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    public class RootContainer : Container, IUriContext
    {
        #region IUriContext
        public Uri BaseUri { get; set; }
        #endregion
    }
}
