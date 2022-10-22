// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.IO;

using System.IO.Compression;

namespace A2v10.Request;

public static class ZipUtils
{
	private const String CONTENT = "content";
	public static Byte[] CompressText(String text)
	{
		using var ms = new MemoryStream();
		using (var archive = new ZipArchive(ms, ZipArchiveMode.Create)) { 
			var entry = archive.CreateEntry(CONTENT, CompressionLevel.Fastest);
			using var wr = new StreamWriter(entry.Open());
			wr.Write(text);
		}
		return ms.ToArray();
	}

	public static String DecompressText(Stream stream)
	{
		using var archive = new ZipArchive(stream, ZipArchiveMode.Read);
		var entry = archive.GetEntry(CONTENT);
		using var sr = new StreamReader(entry.Open());
		return sr.ReadToEnd();
	}
}
