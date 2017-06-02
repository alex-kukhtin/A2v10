using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Tests.DataModelTester
{
	internal class DataTester
	{
		IDataModel _dataModel;
		public DataTester(IDataModel dataModel)
		{
			_dataModel = dataModel;
		}
	}
}
