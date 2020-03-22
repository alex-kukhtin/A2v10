// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Security.Cryptography;

namespace A2v10.Web.Mvc.OAuth2
{
	class Encrypt
	{
		public static String EncryptString_Aes(String text, String key, String iv)
		{
			using (var aes = Aes.Create())
			{
				aes.Key = Convert.FromBase64String(key);
				aes.IV = Convert.FromBase64String(iv);

				var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

				using (var ms = new MemoryStream())
				using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
				{
					using (var sw = new StreamWriter(cs))
					{
						sw.Write(text);
					}
					return Convert.ToBase64String(ms.ToArray());
				}
			}
		}

		public static String DecryptString_Aes(String text, String key, String iv)
		{
			using (var aes = Aes.Create())
			{
				aes.Key = Convert.FromBase64String(key);
				aes.IV = Convert.FromBase64String(iv);

				var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

				using (var ms = new MemoryStream(Convert.FromBase64String(text)))
				using (var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read))
				using (var sr = new StreamReader(cs))
				{
					return sr.ReadToEnd();
				}
			}
		}
	}
}
