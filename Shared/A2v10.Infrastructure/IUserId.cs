﻿// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Infrastructure
{
	public interface IUserId
	{
		Int64 UserId { get; }
	}

	public interface IUserInfo
	{
		Int64 UserId { get; set; }
		Boolean IsAdmin { get; set; }
		Boolean IsTenantAdmin { get; set; }
		Boolean IsExternalUser { get; set; }
	}

	public struct FullUserInfo
	{
		public Int64 UserId { get; set; }
		public String UserName { get; set; }
		public String PersonName { get; set; }
	}

	public interface ISupportUserInfo
	{
		FullUserInfo  UserInfo { get; }
	}
}
