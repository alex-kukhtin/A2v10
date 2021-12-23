// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;

using A2v10.Data.Interfaces;

namespace A2v10.Messaging
{
	public abstract class TemplatedMessage
	{
		public String Schema { get; set; }
		public String Model { get; set; }
		public String Source { get; set; }

		public abstract Task<IMessageForSend> ResolveAndSendAsync(MessageResolver resolver);

        private IDataModel _dataModel;

		public async Task<IDataModel> GetDataModelAsync(IDbContext dbContext, ExpandoObject prms)
		{
			if (String.IsNullOrEmpty(Model))
				return null;
			if (_dataModel == null)
			{
				_dataModel = await dbContext.LoadModelAsync(Source, $"[{Schema}].[{Model}.Load]", prms);
			}
			return _dataModel;
		}
    }
}
