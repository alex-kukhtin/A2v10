// Copyright © 2020-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Globalization;
using System.Net;
using System.Security.Cryptography;

namespace A2v10.Interop.AzureStorage
{
	public class AzureRequestInfo
	{
		public String Date { get; }
		public String StorageServiceVersion { get; }
		public String BlobType { get; }

		public AzureRequestInfo()
		{
			Date = DateTime.UtcNow.ToString("R", CultureInfo.InvariantCulture);
			StorageServiceVersion = "2015-02-21";
			BlobType = "BlockBlob";
		}
	}

	public class AzureStorageRestClient
	{

		public Task<Byte[]> GetBlob(String blobName)
		{
			var container = Path.GetDirectoryName(blobName);
			var blob = Path.GetFileName(blobName);
			return Get(null, container, blob);
		}

		public async Task<Byte[]> Get(String source, String container, String blob)
		{
			var config = new AzureStorageConfig(source);
			var ari = new AzureRequestInfo();

			var urlPath = Uri.EscapeDataString($"{container}/{blob}");
			var url = config.GetUrl(urlPath);

			var wr = WebRequest.Create(url);
			wr.Method = "GET";
			wr.Headers.Add("x-ms-blob-type", ari.BlobType);
			wr.Headers.Add("x-ms-date", ari.Date);
			wr.Headers.Add("x-ms-version", ari.StorageServiceVersion);
			wr.Headers.Add("Authorization", GetAuthHeader(config, "GET", ari, urlPath, String.Empty));
			using (var resp = await wr.GetResponseAsync())
			{
				var ms = new MemoryStream();
				await resp.GetResponseStream().CopyToAsync(ms);
				ms.Seek(0, SeekOrigin.Begin);
				return ms.GetBuffer();
			}
		}

		public async Task<AzureStoragePutResult> Put(String source, String container, String blob, Stream stream, Int64 len)
		{
			var config = new AzureStorageConfig(source);
			var ari = new AzureRequestInfo();
			var urlPath = Uri.EscapeDataString($"{container}/{blob}");
			var url = config.GetUrl(urlPath);

			var wr = WebRequest.Create(url);
			wr.Method = "PUT";
			wr.ContentLength = len;
			wr.Headers.Add("x-ms-blob-type", ari.BlobType);
			wr.Headers.Add("x-ms-date", ari.Date);
			wr.Headers.Add("x-ms-version", ari.StorageServiceVersion);
			wr.Headers.Add("Authorization", GetAuthHeader(config, "PUT", ari, urlPath, len.ToString()));
			using (var rs = await wr.GetRequestStreamAsync())
			{
				stream.CopyTo(rs);
			}
			using (var resp = await wr.GetResponseAsync())
			{
				return new AzureStoragePutResult();
			}
		}

		private String GetAuthHeader(AzureStorageConfig config, String method, AzureRequestInfo info, String urlPath, String length)
		{
			var canonicalizedHeaders = $"x-ms-blob-type:{info.BlobType}\nx-ms-date:{info.Date}\nx-ms-version:{info.StorageServiceVersion}";
			var canonicalizedResource = $"/{config.AccountName}/{urlPath}";
			var stringToSign = $"{method}\n\n\n{length}\n\n\n\n\n\n\n\n\n{canonicalizedHeaders}\n{canonicalizedResource}";
			return CreateAuthorizationHeader(config, stringToSign);
		}

		public String CreateAuthorizationHeader(AzureStorageConfig config, String canonicalizedString)
		{
			using (var hmacSha256 = new HMACSHA256(Convert.FromBase64String(config.AccountKey)))
			{
				var dataToHmac = Encoding.UTF8.GetBytes(canonicalizedString);
				var signature = Convert.ToBase64String(hmacSha256.ComputeHash(dataToHmac));
				return $"SharedKey {config.AccountName}:{signature}";
			}
		}

	}
}
