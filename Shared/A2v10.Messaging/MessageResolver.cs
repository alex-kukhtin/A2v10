
using A2v10.Data.Interfaces;

namespace A2v10.Messaging
{
	public class MessageResolver
	{
		private readonly IDbContext _dbContext;

		public MessageResolver(IDbContext dbContext)
		{
			_dbContext = dbContext;
		}
	}
}
