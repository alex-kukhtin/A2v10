// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Security.Cryptography;

namespace A2v10.Web.Identity.ApiKey
{
	public static class ApiKeyGenerator
	{
		public static String GenerateKey(Int32 size = 48)
		{
			using (var provider = new RNGCryptoServiceProvider())
			{
				Byte[] data = new Byte[size];
				provider.GetNonZeroBytes(data);
				String res = Convert.ToBase64String(data);
				res = res.Remove(res.Length - 2);
				return res;
			}
		}
	}
}
