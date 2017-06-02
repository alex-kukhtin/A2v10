
using System;
using System.Data;
using System.Data.SqlClient;

namespace A2v10.Data
{
	public static class SqlExtensions
	{
		public static SqlCommand CreateCommandSP(this SqlConnection cnn, String command)
		{
			var cmd = cnn.CreateCommand();
			cmd.CommandText = command;
			cmd.CommandType = CommandType.StoredProcedure;
			return cmd;
		}

	}
}
