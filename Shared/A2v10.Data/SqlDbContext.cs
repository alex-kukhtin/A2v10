using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Data.SqlTypes;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Data
{
	public class SqlDbContext : IDbContext
	{
        IApplicationHost _host;

		public SqlDbContext(IApplicationHost host)
		{
            _host = host;
		}

        public String ConnectionString
        {
            get { return _host.ConnectionString; }
        }

		public async Task<SqlConnection> GetConnectionAsync()
		{
			var cnnStr = _host.ConnectionString;
			var cnn = new SqlConnection(cnnStr);
			await cnn.OpenAsync();
			return cnn;
		}

		public async Task<IDataModel> LoadModelAsync(String command, Object prms = null)
		{
			var modelReader = new DataModelReader();
			using (var p = _host.Profiler.Start(ProfileAction.Sql, command))
			{
				await ReadDataAsync(command,
					(prm) =>
					{
                        modelReader.SetParameters(prm, prms);
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
			using (var p = _host.Profiler.Start(ProfileAction.Sql, command))
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
			using (var p = _host.Profiler.Start(ProfileAction.Sql, command))
			{
                var helper = new LoadHelper<T>();
                using (var cnn = await GetConnectionAsync())
				{
                    using (var cmd = cnn.CreateCommandSP(command))
                    {
                        SqlExtensions.SetFromDynamic(cmd.Parameters, prms);
                        using (var rdr = await cmd.ExecuteReaderAsync())
                        {
                            helper.ProcessRecord(rdr);
                            if (await rdr.ReadAsync())
                            {
                                T result = helper.ProcessFields(rdr);
                                return result;
                            }
                        }
                    }
                }
            }
			return null;
		}


        void SetParametersFrom<T>(SqlCommand cmd, T element)
        {
            Type retType = typeof(T);
            var props = retType.GetProperties(BindingFlags.Public | BindingFlags.Instance);
            SqlCommandBuilder.DeriveParameters(cmd);
            var sqlParams = cmd.Parameters;
            foreach (var p in props)
            {
                var paramName = "@" + p.Name;
                if (sqlParams.Contains(paramName))
                {
                    var sqlParam = sqlParams[paramName];
                    var sqlVal = p.GetValue(element);
                    if (sqlParam.SqlDbType == SqlDbType.VarBinary)
                    {
                        var stream = sqlVal as Stream;
                        if (stream == null)
                            throw new IndexOutOfRangeException("Stream expected");
                        sqlParam.Value = new SqlBytes(stream);
                    }
                    else
                    {
                        sqlParam.Value = SqlExtensions.ConvertTo(sqlVal, sqlParam.SqlDbType.ToType());
                    }
                }
            }
        }

        public async Task ExecuteAsync<T>(String command, T element) where T : class
		{
			using (var p = _host.Profiler.Start(ProfileAction.Sql, command))
			{
				using (var cnn = await GetConnectionAsync())
				{
					using (var cmd = cnn.CreateCommandSP(command))
					{
                        SetParametersFrom(cmd, element);
                        await cmd.ExecuteNonQueryAsync();
					}
				}
			}
		}

		public async Task<IList<T>> LoadListAsync<T>(String command, Object prms) where T : class
		{
			using (var token = _host.Profiler.Start(ProfileAction.Sql, command))
			{
                Type retType = typeof(T);
                var props = retType.GetProperties();
                var result = new List<T>();
                using (var cnn = await GetConnectionAsync())
				{
					using (var cmd = cnn.CreateCommandSP(command))
					{
                        SqlExtensions.SetFromDynamic(cmd.Parameters, prms);
                        using (var rdr = await cmd.ExecuteReaderAsync())
                        {
                            var keyMap = new Dictionary<String, Int32>();
                            for (int c = 0; c < rdr.FieldCount; c++)
                            {
                                keyMap.Add(rdr.GetName(c), c);
                            }
                            while (await rdr.ReadAsync())
                            {
                                T item = System.Activator.CreateInstance(retType) as T;
                                Int32 fieldIndex;
                                foreach (var p in props)
                                {
                                    if (keyMap.TryGetValue(p.Name, out fieldIndex))
                                    {
                                        var dbVal = rdr.GetValue(fieldIndex);
                                        if (dbVal == DBNull.Value)
                                            dbVal = null;
                                        p.SetValue(item, dbVal);
                                    }
                                }
                                result.Add(item);
                            }
                        }
					}
				}
                return result;
            }
        }
	}
}
