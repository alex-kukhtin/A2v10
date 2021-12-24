using System;
using A2v10.Data.Interfaces;

namespace A2v10.Web.Site.Mvc.Impl
{
    public class CustomTokenProvider : ITokenProvider
    {
        public String GenerateToken(Guid accessToken)
        {
            throw new NotImplementedException();
        }
    }
}