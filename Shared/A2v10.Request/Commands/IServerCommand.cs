// Copyright © 2019-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;

namespace A2v10.Request
{
	public class ServerCommandResult
	{
		private String _conentType;

		public ServerCommandResult()
		{
		}

		public ServerCommandResult(String data)
		{
			Data = data;
		}

        public ServerCommandResult(Byte[] data, String contentType)
        {
            Stream = data;
			_conentType = contentType;
        }

        public String Data { get; set; }

		public Byte[] Stream { get; set; }

		public String ContentType
		{
			get
			{
				return _conentType ?? "application/json";
			}
			set
			{
				_conentType = value;
			}
		}

		public String FileName { get; set; }
	}

	public interface IServerCommand
	{
		Task<ServerCommandResult> Execute(RequestCommand cmd, ExpandoObject dataToExec);
	}
}


