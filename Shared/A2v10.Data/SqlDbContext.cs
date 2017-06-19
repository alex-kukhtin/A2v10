using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Data
{
	public class SqlDbContext : IDbContext
	{
		IConfiguration _config;

		public SqlDbContext(IConfiguration config)
		{
			_config = config;
		}

		public async Task<SqlConnection> GetConnectionAsync()
		{
			var cnnStr = _config.GetConnectionString();
			var cnn = new SqlConnection(cnnStr);
			await cnn.OpenAsync();
			return cnn;
		}

		public async Task<IDataModel> LoadModelAsync(String command, Object prms = null)
		{
			var modelReader = new DataModelReader();
			using (var p = _config.Profiler.Start(ProfileAction.Sql, command))
			{
				await ReadDataAsync(command,
					(prm) =>
					{
					},
					(no, rdr) =>
					{
						modelReader.ProcessOneRecord(rdr);
					},
					(no, rdr) =>
					{
						modelReader.ProcessOneMetadata(rdr);
					});
			}
			return modelReader.DataModel;
		}
	
		public async Task ReadDataAsync(String command,
			Action<SqlParameterCollection> setParams,
			Action<Int32, IDataReader> onRead,
			Action<Int32, IDataReader> onMetadata)
		{
			using (var cnn = await GetConnectionAsync())
			{
				Int32 rdrNo = 0;
				using (var cmd = cnn.CreateCommandSP(command))
				{
					if (setParams != null)
						setParams(cmd.Parameters);
					using (SqlDataReader rdr = await cmd.ExecuteReaderAsync())
					{
						do
						{
							if (onMetadata != null)
								onMetadata(rdrNo, rdr);
							while (await rdr.ReadAsync())
							{
								if (onRead != null)
									onRead(rdrNo, rdr);
							}
							rdrNo += 1;
						} while (await rdr.NextResultAsync());
					}
				}
			}
		}

		public async Task<IDataModel> SaveModelAsync(String command, Object data, Object prms = null)
		{
			var dataReader = new DataModelReader();
			var dataWriter = new DataModelWriter();
			using (var p = _config.Profiler.Start(ProfileAction.Sql, command))
			{
				var metadataCommand = command.Replace(".Update", ".Metadata");
				using (var cnn = await GetConnectionAsync())
				{
					using (var cmd = cnn.CreateCommandSP(metadataCommand))
					{
						using (var rdr = await cmd.ExecuteReaderAsync())
						{
							do
							{
								dataWriter.ProcessOneMetadata(rdr);
							}
							while (await rdr.NextResultAsync());
						}
					}
					using (var cmd = cnn.CreateCommandSP(command))
					{
						SqlCommandBuilder.DeriveParameters(cmd);
						dataWriter.SetTableParameters(cmd, data, prms);
						using (var rdr = await cmd.ExecuteReaderAsync())
						{
							do
							{
								// metadata is not needed
								while (await rdr.ReadAsync())
								{
									dataReader.ProcessOneRecord(rdr);
								}
							}
							while (await rdr.NextResultAsync());
						}
					}				
				}
				return dataReader.DataModel;
			}
		}

		public async Task<T> LoadAsync<T>(String command, Object prms = null) where T : class
		{
			using (var p = _config.Profiler.Start(ProfileAction.Sql, command))
			{
				using (var cnn = await GetConnectionAsync())
				{

				}
			}
			return null;
		}


		public async Task ExecuteAsync<T>(String command, T element) where T : class
		{
			using (var p = _config.Profiler.Start(ProfileAction.Sql, command))
			{
				using (var cnn = await GetConnectionAsync())
				{
					using (var cmd = cnn.CreateCommandSP(command))
					{
					}
				}
			}
		}

		public async Task<IList<T>> LoadListAsync<T>(String command, Object prms) where T : class
		{
			using (var p = _config.Profiler.Start(ProfileAction.Sql, command))
			{
				using (var cnn = await GetConnectionAsync())
				{
					using (var cmd = cnn.CreateCommandSP(command))
					{
					}
				}
			}
			return null;
		}
	}
}
