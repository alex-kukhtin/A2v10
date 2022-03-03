﻿// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Globalization;
using System.Threading.Tasks;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Interop;

namespace BackgroundProcessor
{
    public class SmsService : ISmsService
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
            if (!(await _smsApi.SendSmsAsync(phone, message, extId) is Ip2SmsResponse result))
                throw new InvalidProgramException("SendSms error");

            if (result.State?.ToLower(CultureInfo.InvariantCulture) != "accepted")
                throw new InvalidProgramException($"SendSms error. Error='{result.Error ?? "unknown"}'");
        }
        public void SendSms(String phone, String message, String extId)
        {
            if (!(_smsApi.SendSms(phone, message, extId) is Ip2SmsResponse result))
                throw new InvalidProgramException("SendSms error");

            if (result.State?.ToLower(CultureInfo.InvariantCulture) != "accepted")
                throw new InvalidProgramException($"SendSms error. Error='{result.Error ?? "unknown"}'");
        }
    }
}
