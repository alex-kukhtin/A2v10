// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Globalization;

using Microsoft.AspNet.Identity;

using A2v10.Infrastructure;
using A2v10.Interop;
using A2v10.Data.Interfaces;

namespace A2v10.Web.Identity
{
	public class SmsService : ISmsService, IIdentityMessageService
	{
		private readonly ILogger _logger;
		private readonly Ip2SmsClient _smsApi;
		private readonly IDbContext _dbContext;

		public SmsService(IDbContext dbContext, ILogger logger)
		{
			_logger = logger ?? throw new ArgumentNullException(nameof(logger));
			_dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));

			_smsApi = new Ip2SmsClient(_logger, _dbContext);
		}

		public async Task SendSmsAsync(String phone, String message, String extId)
		{
			//throw new NotImplementedException("SendMessageAsync is not implemented");
			if (!(await _smsApi.SendSmsAsync(phone, message, extId) is Ip2SmsResponse result))
				throw new InvalidProgramException("SendSms error");

			if (result.State?.ToLower(CultureInfo.InvariantCulture) != "accepted")
				throw new InvalidProgramException($"SendSms error. Error='{result.Error ?? "unknown"}'");
		}

		public Task SendAsync(IdentityMessage message)
		{
			String userId = null;
			if (message is IUserId iUserId)
				userId = iUserId.UserId.ToString();
			return SendSmsAsync(message.Destination, message.Body, userId);
		}
	}
}
