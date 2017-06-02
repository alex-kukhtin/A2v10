
using System;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public interface IDbContext
	{
		Task<SqlConnection> GetConnectionAsync();
		Task<IDataModel> LoadModelAsync(String command, Object prms = null);
	}
}
