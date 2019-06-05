
using System;
using System.Web;

namespace A2v10.Request
{
	public interface IRequestHandler
	{

	}

	public class FileHandler : IRequestHandler
	{
		public void Process(String url, HttpRequestBase request, HttpResponseBase response)
		{
			if (request.HttpMethod == "GET")
			{
			}
			else if (request.HttpMethod == "POST")
			{

			}
		}
	}
}
