
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public interface IDbContext
	{
        String ConnectionString { get; }
		Task<SqlConnection> GetConnectionAsync();
		Task<IDataModel> LoadModelAsync(String command, Object prms = null);
		Task<IDataModel> SaveModelAsync(String command, Object data, Object prms = null);

		Task<T> LoadAsync<T>(String command, Object prms = null) where T : class;
		Task<IList<T>> LoadListAsync<T>(String command, Object prms) where T : class;

        void Execute<T>(String Command, T element) where T : class;
        Task ExecuteAsync<T>(String command, T element) where T : class;

        void SaveList<T>(String command, Object prms, IEnumerable<T> list) where T : class;
        Task SaveListAsync<T>(String command, Object prms, IEnumerable<T> list) where T : class;
    }
}
