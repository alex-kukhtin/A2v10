using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Web.Mvc.OAuth2
{
	public class ApiV2User
	{
		public Int64 Id { get; set; }
		public Int32 TenantId { get; set; }
		public String Name { get; set; }
		public String Segment { get; set; }

		public String AllowIp { get; set; }
		public String AllowOrigin { get; set; }
	}
}
