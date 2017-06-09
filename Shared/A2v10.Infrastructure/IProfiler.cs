using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public enum ProfileAction
	{
		Sql,
		Xaml
	};

	public interface IProfiler
	{
		IDisposable Start(ProfileAction kind, String description);
	}
}
