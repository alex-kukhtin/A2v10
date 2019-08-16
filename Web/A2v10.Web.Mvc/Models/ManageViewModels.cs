// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;

namespace A2v10.Web.Mvc.Models
{
    public class IndexViewModel
    {
        public Boolean HasPassword { get; set; }
        public IList<UserLoginInfo> Logins { get; set; }
        public String PhoneNumber { get; set; }
        public Boolean TwoFactor { get; set; }
        public Boolean BrowserRemembered { get; set; }
    }

    public class ManageLoginsViewModel
    {
        public IList<UserLoginInfo> CurrentLogins { get; set; }
        public IList<AuthenticationDescription> OtherLogins { get; set; }
    }

    public class FactorViewModel
    {
        public String Purpose { get; set; }
    }


    public class AddPhoneNumberViewModel
    {
        [Required]
        [Phone]
        [Display(Name = "Phone Number")]
        public String Number { get; set; }
    }

    public class VerifyPhoneNumberViewModel
    {
        [Required]
        [Display(Name = "Code")]
        public String Code { get; set; }

        [Required]
        [Phone]
        [Display(Name = "Phone Number")]
        public String PhoneNumber { get; set; }
    }

    public class ConfigureTwoFactorViewModel
    {
        public String SelectedProvider { get; set; }
        public ICollection<System.Web.Mvc.SelectListItem> Providers { get; set; }
    }
}