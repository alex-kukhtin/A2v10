using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace A2v10.Web.Mvc.Models
{
	public class SendCodeViewModel
	{
		public string SelectedProvider { get; set; }
		public ICollection<System.Web.Mvc.SelectListItem> Providers { get; set; }
		public string ReturnUrl { get; set; }
		public bool RememberMe { get; set; }
	}

	public class VerifyCodeViewModel
	{
		[Required]
		public string Provider { get; set; }

		[Required]
		[Display(Name = "Code")]
		public string Code { get; set; }
		public string ReturnUrl { get; set; }

		[Display(Name = "Remember this browser?")]
		public bool RememberBrowser { get; set; }

		public bool RememberMe { get; set; }
	}

	public class ForgotViewModel
	{
		[Required]
		public string Email { get; set; }
	}

	public class AppTitleModel
	{
		public String AppTitle { get; set; }
		public String AppSubTitle { get; set; }
	}

	public class LoginViewModel
	{
		public String Name { get; set; }
		public String Password { get; set; }
		public Boolean RememberMe { get; set; }
	}

	public class RegisterTenantModel
	{
		public Int32 Id { get; set; }
		public String Name { get; set; }
		public String Email { get; set; }
		public String Password { get; set; }
		public String PersonName { get; set; }
		public String Phone { get; set; }
	}

	public class RegisterViewModel
	{
		[Display(Name = "Name")]
		public string Name { get; set; }

		[EmailAddress]
		public string Email { get; set; }

		[Required]
		[DataType(DataType.Password)]
		public string Password { get; set; }

		[DataType(DataType.Password)]
		[Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
		public string ConfirmPassword { get; set; }
	}

	public class ResetPasswordViewModel
	{
		[Required]
		public string Name { get; set; }

		[Required]
		[DataType(DataType.Password)]
		public string Password { get; set; }

		[DataType(DataType.Password)]
		[Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
		public String ConfirmPassword { get; set; }

		public String Code { get; set; }
	}

	public class ChangePasswordViewModel
	{
		public Int64 Id { get; set; }
		[DataType(DataType.Password)]
		public String OldPassword { get; set; }
		[DataType(DataType.Password)]
		public String NewPassword { get; set; }
	}

	public class ForgotPasswordViewModel
	{
		[Required]
		public String Name { get; set; }
	}
}
