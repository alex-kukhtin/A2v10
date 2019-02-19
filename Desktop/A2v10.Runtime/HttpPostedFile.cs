// Copyright © 2018-2019 Alex Kukhtin. All rights reserved.

using System;

using System.Collections.Generic;
using System.IO;
using System.Web;

namespace A2v10.Runtime
{
	public class SimpleHttpPostedFileBase : HttpPostedFileBase
	{
		private readonly Int32 _length;
		private readonly String _mime;
		private readonly String _name;
		private readonly Stream _stream;

		public override Int32 ContentLength => _length;
		public override String ContentType => _mime;
		public override String FileName => _name;
		public override Stream InputStream => _stream;

		public SimpleHttpPostedFileBase(String fileName, String mime)
		{
			_name = fileName;
			_mime = mime;
			if (String.IsNullOrEmpty(_mime))
				_mime = MimeMapping.GetMimeMapping(fileName);
			_length = 0;
			_stream = File.OpenRead(fileName);
		}
	}

	public class SimpleHttpFileCollection : HttpFileCollectionBase
	{
		List<SimpleHttpPostedFileBase> _list;
		public SimpleHttpFileCollection(String files)
		{
			_list = new List<SimpleHttpPostedFileBase>();
			foreach (var f in files.Split('\t'))
			{
				if (String.IsNullOrEmpty(f))
					continue;
				var fn = f.Split('\b');
				_list.Add(new SimpleHttpPostedFileBase(fn[0], fn[1]));
			}
		}

		public override Int32 Count => _list.Count;

		public override HttpPostedFileBase this[Int32 index]
		{
			get
			{
				return _list[index];
			}
		}
	}
}
