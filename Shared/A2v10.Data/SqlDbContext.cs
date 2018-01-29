// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Data.SqlTypes;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;

using A2v10.Infrastructure;

namespace A2v10.Data
{
    public class SqlDbContext : IDbContext, ISupportStopService
    {
        IApplicationHost _host;

        const String RET_PARAM_NAME = "@RetId";
        const String SET_TENANT_CMD = "[a2security].[SetTenantId]";

        public SqlDbContext(IApplicationHost host)
        {
            _host = host;
        }

        public String ConnectionString(String source)
        {
            // TODO
            return _host.ConnectionString(source);
        }

        public async Task<SqlConnection> GetConnectionAsync(String source)
        {
            var cnnStr = _host.ConnectionString(source);
            var cnn = new SqlConnection(cnnStr);
            await cnn.OpenAsync();
            await SetTenantIdAsync(source, cnn);
            return cnn;
        }

        public void Stop()
        {
        }

        public SqlConnection GetConnection(String source)
        {
            var cnnStr = _host.ConnectionString(source);
            var cnn = new SqlConnection(cnnStr);
            cnn.Open();
            SetTenantId(source, cnn);
            return cnn;
        }

        async Task SetTenantIdAsync(String source, SqlConnection cnn)
        {
            if (!_host.IsMultiTenant)
                return;
            if (source == _host.CatalogDataSource)
                return;
            using (_host.Profiler.CurrentRequest.Start(ProfileAction.Sql, SET_TENANT_CMD))
            {
                using (var cmd = cnn.CreateCommandSP(SET_TENANT_CMD))
                {
                    cmd.Parameters.AddWithValue("@TenantId", _host.TenantId);
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        void SetTenantId(String source, SqlConnection cnn)
        {
            if (!_host.IsMultiTenant)
                return;
            if (source == _host.CatalogDataSource)
                return;
            using (_host.Profiler.CurrentRequest.Start(ProfileAction.Sql, SET_TENANT_CMD))
            {
                using (var cmd = cnn.CreateCommandSP(SET_TENANT_CMD))
                {
                    cmd.Parameters.AddWithValue("@TenantId", _host.TenantId);
                    cmd.ExecuteNonQuery();
                }
            }
        }

        public async Task<IDataModel> LoadModelAsync(String source, String command, Object prms = null)
        {
            var modelReader = new DataModelReader();
            using (var p = _host.Profiler.CurrentRequest.Start(ProfileAction.Sql, command))
            {
                await ReadDataAsync(source, command,
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
            modelReader.PostProcess();
            return modelReader.DataModel;
        }

        public IDataModel LoadModel(String source, String command, Object prms = null)
        {
            var modelReader = new DataModelReader();
            using (var p = _host.Profiler.CurrentRequest.Start(ProfileAction.Sql, command))
            {
                ReadData(source, command,
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
            modelReader.PostProcess();
            return modelReader.DataModel;
        }

        async Task ReadDataAsync(String source, String command,
            Action<SqlParameterCollection> setParams,
            Action<Int32, IDataReader> onRead,
            Action<Int32, IDataReader> onMetadata)
        {
            using (var cnn = await GetConnectionAsync(source))
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

        void ReadData(String source, String command,
            Action<SqlParameterCollection> setParams,
            Action<Int32, IDataReader> onRead,
            Action<Int32, IDataReader> onMetadata)
        {
            using (var cnn = GetConnection(source))
            {
                Int32 rdrNo = 0;
                using (var cmd = cnn.CreateCommandSP(command))
                {
                    if (setParams != null)
                        setParams(cmd.Parameters);
                    using (SqlDataReader rdr = cmd.ExecuteReader())
                    {
                        do
                        {
                            if (onMetadata != null)
                                onMetadata(rdrNo, rdr);
                            while (rdr.Read())
                            {
                                if (onRead != null)
                                    onRead(rdrNo, rdr);
                            }
                            rdrNo += 1;
                        } while (rdr.NextResult());
                    }
                }
            }
        }

        public IDataModel SaveModel(String source, String command, Object data, Object prms = null)
        {
            var dataReader = new DataModelReader();
            var dataWriter = new DataModelWriter();
            using (var p = _host.Profiler.CurrentRequest.Start(ProfileAction.Sql, command))
            {
                var metadataCommand = command.Replace(".Update", ".Metadata");
                using (var cnn = GetConnection(source))
                {
                    using (var cmd = cnn.CreateCommandSP(metadataCommand))
                    {
                        using (var rdr = cmd.ExecuteReader())
                        {
                            do
                            {
                                dataWriter.ProcessOneMetadata(rdr);
                            }
                            while (rdr.NextResult());
                        }
                    }
                    using (var cmd = cnn.CreateCommandSP(command))
                    {
                        SqlCommandBuilder.DeriveParameters(cmd);
                        dataWriter.SetTableParameters(cmd, data, prms);
                        using (var rdr = cmd.ExecuteReader())
                        {
                            do
                            {
                                // metadata is not needed
                                while (rdr.Read())
                                {
                                    dataReader.ProcessOneRecord(rdr);
                                }
                            }
                            while (rdr.NextResult());
                        }
                    }
                }
                dataReader.PostProcess();
                return dataReader.DataModel;
            }
        }

        public async Task<IDataModel> SaveModelAsync(String source, String command, Object data, Object prms = null)
        {
            var dataReader = new DataModelReader();
            var dataWriter = new DataModelWriter();
            using (var p = _host.Profiler.CurrentRequest.Start(ProfileAction.Sql, command))
            {
                var metadataCommand = command.Replace(".Update", ".Metadata");
                using (var cnn = await GetConnectionAsync(source))
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
                                // metadata is not needed (exclude aliases)
                                dataReader.ProcessMetadataAliases(rdr);
                                while (await rdr.ReadAsync())
                                {
                                    dataReader.ProcessOneRecord(rdr);
                                }
                            }
                            while (await rdr.NextResultAsync());
                        }
                    }
                }
                dataReader.PostProcess();
                return dataReader.DataModel;
            }
        }

        public async Task<T> LoadAsync<T>(String source, String command, Object prms = null) where T : class
        {
            using (var p = _host.Profiler.CurrentRequest.Start(ProfileAction.Sql, command))
            {
                var helper = new LoadHelper<T>();
                using (var cnn = await GetConnectionAsync(source))
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

        public T Load<T>(String source, String command, Object prms = null) where T : class
        {
            using (var p = _host.Profiler.CurrentRequest.Start(ProfileAction.Sql, command))
            {
                var helper = new LoadHelper<T>();
                using (var cnn = GetConnection(source))
                {
                    using (var cmd = cnn.CreateCommandSP(command))
                    {
                        SqlExtensions.SetFromDynamic(cmd.Parameters, prms);
                        using (var rdr = cmd.ExecuteReader())
                        {
                            helper.ProcessRecord(rdr);
                            if (rdr.Read())
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


        SqlParameter SetParametersFrom<T>(SqlCommand cmd, T element)
        {
            Type retType = typeof(T);
            var props = retType.GetProperties(BindingFlags.Public | BindingFlags.Instance);
            SqlCommandBuilder.DeriveParameters(cmd);
            var sqlParams = cmd.Parameters;
            SqlParameter retParam = null;
            if (cmd.Parameters.Contains(RET_PARAM_NAME))
            {
                retParam = cmd.Parameters[RET_PARAM_NAME];
                retParam.Value = DBNull.Value;
            }
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
            return retParam;
        }

        void SetReturnParamResult(SqlParameter retParam, Object element)
        {
            if (retParam == null)
                return;
            if (retParam.Value == DBNull.Value)
                return;
            var idProp = element.GetType().GetProperty("Id");
            if (idProp != null)
                idProp.SetValue(element, retParam.Value);
        }

        public async Task ExecuteAsync<T>(String source, String command, T element) where T : class
        {
            using (var p = _host.Profiler.CurrentRequest.Start(ProfileAction.Sql, command))
            {
                using (var cnn = await GetConnectionAsync(source))
                {
                    using (var cmd = cnn.CreateCommandSP(command))
                    {
                        var retParam = SetParametersFrom(cmd, element);
                        await cmd.ExecuteNonQueryAsync();
                        SetReturnParamResult(retParam, element);
                    }
                }
            }
        }

        public void Execute<T>(String source, String command, T element) where T : class
        {
            using (var p = _host.Profiler.CurrentRequest.Start(ProfileAction.Sql, command))
            {
                using (var cnn = GetConnection(source))
                {
                    using (var cmd = cnn.CreateCommandSP(command))
                    {

                        var retParam = SetParametersFrom(cmd, element);
                        cmd.ExecuteNonQuery();
                        SetReturnParamResult(retParam, element);
                    }
                }
            }
        }

        public async Task<IList<T>> LoadListAsync<T>(String source, String command, Object prms) where T : class
        {
            using (var token = _host.Profiler.CurrentRequest.Start(ProfileAction.Sql, command))
            {
                Type retType = typeof(T);
                var props = retType.GetProperties();
                var result = new List<T>();
                using (var cnn = await GetConnectionAsync(source))
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

        void SetParametersWithList<T>(SqlCommand cmd, Object prms, IEnumerable<T> list) where T : class
        {
            Type listType = typeof(T);
            Type prmsType = prms != null ? prms.GetType() : null;
            var props = listType.GetProperties(BindingFlags.Public | BindingFlags.Instance);
            var propsD = new Dictionary<String, PropertyInfo>();
            DataTable dt = new DataTable();
            foreach (var p in props)
            {
                var column = new DataColumn(p.Name, p.PropertyType);
                if (p.PropertyType == typeof(String))
                    column.MaxLength = 32767;
                dt.Columns.Add(column);
                propsD.Add(p.Name, p);
            }
            for (int i = 0; i < cmd.Parameters.Count; i++)
            {
                SqlParameter prm = cmd.Parameters[i];
                var simpleParamName = prm.ParameterName.Substring(1); // skip @
                if (prm.SqlDbType == SqlDbType.Structured)
                {
                    foreach (var itm in list)
                    {
                        var row = dt.NewRow();
                        for (int c = 0; c < dt.Columns.Count; c++)
                        {
                            var col = dt.Columns[c];
                            var rowVal = propsD[col.ColumnName].GetValue(itm);
                            var dbVal = SqlExtensions.ConvertTo(rowVal, col.DataType);
                            row[col.ColumnName] = dbVal;
                        }
                        dt.Rows.Add(row);
                    }
                    prm.Value = dt;
                    prm.RemoveDbName(); // remove first segment (database name)
                }
                else if (prmsType != null)
                {
                    // scalar parameter
                    var pi = prmsType.GetProperty(simpleParamName);
                    if (pi != null)
                        prm.Value = pi.GetValue(prms);
                }
            }
        }

        public void SaveList<T>(String source, String command, Object prms, IEnumerable<T> list) where T : class
        {
            using (var token = _host.Profiler.CurrentRequest.Start(ProfileAction.Sql, command))
            {
                using (var cnn = GetConnection(source))
                {
                    using (var cmd = cnn.CreateCommandSP(command))
                    {
                        SqlCommandBuilder.DeriveParameters(cmd);
                        SetParametersWithList<T>(cmd, prms, list);
                        cmd.ExecuteNonQuery();
                    }
                }
            }
        }

        public async Task SaveListAsync<T>(String source, String command, Object prms, IEnumerable<T> list) where T : class
        {
            using (var token = _host.Profiler.CurrentRequest.Start(ProfileAction.Sql, command))
            {
                using (var cnn = await GetConnectionAsync(source))
                {
                    using (var cmd = cnn.CreateCommandSP(command))
                    {
                        SqlCommandBuilder.DeriveParameters(cmd);
                        SetParametersWithList<T>(cmd, prms, list);
                        await cmd.ExecuteNonQueryAsync();
                    }
                }
            }
        }
    }
}
