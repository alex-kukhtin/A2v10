
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public interface IDbContext
	{
        String ConnectionString(String source);
		Task<SqlConnection> GetConnectionAsync(String source);
		Task<IDataModel> LoadModelAsync(String source, String command, Object prms = null);
		Task<IDataModel> SaveModelAsync(String source, String command, Object data, Object prms = null);

		Task<T> LoadAsync<T>(String source, String command, Object prms = null) where T : class;
		Task<IList<T>> LoadListAsync<T>(String source, String command, Object prms) where T : class;

        void Execute<T>(String source, String Command, T element) where T : class;
        Task ExecuteAsync<T>(String source, String command, T element) where T : class;

        void SaveList<T>(String source, String command, Object prms, IEnumerable<T> list) where T : class;
        Task SaveListAsync<T>(String source, String command, Object prms, IEnumerable<T> list) where T : class;
    }
}
