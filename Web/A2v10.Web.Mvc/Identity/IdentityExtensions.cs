
using System;
using System.Security.Principal;
using System.Security.Claims;
using Microsoft.AspNet.Identity;

namespace A2v10.Web.Mvc.Identity
{
    public static class IdentityExtensions
    {
        public static string GetUserPersonName(this IIdentity identity)
        {
            var user = identity as ClaimsIdentity;
            if (user == null)
                return null;
            var value = user.FindFirstValue("PersonName");
            return String.IsNullOrEmpty(value) ? identity.GetUserName() : value;
        }
    }
}
