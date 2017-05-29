using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public interface IDbContext
	{
		Task<SqlConnection> GetConnectionAsync();
		Task<T> LoadAsync<T>(String command, Object prms) where T : class;
	}
}
