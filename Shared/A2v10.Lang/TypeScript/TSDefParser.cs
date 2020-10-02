// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace A2v10.Lang
{
	public class TSType
	{
		public readonly String TypeName;
		public readonly String BaseType;
		public readonly String GenericArg;

		public TSType(String name)
		{
			TypeName = name;
		}

		public TSType(String name, String arg)
		{
			BaseType = name;
			GenericArg = arg;
			TypeName = $"{name}<{arg}>";
		}

		public String RealType => GenericArg ?? TypeName;
	}

	public class TSDefParser
	{
		private Tokenizer _tok;
		private readonly ModelMetadata _mm;
		private readonly IApplicationReader _reader;
		private readonly String _path;

		public TSDefParser(IApplicationReader reader, String path)
		{
			_reader = reader;
			_path = path;
			_mm = new ModelMetadata();
		}

		public ModelMetadata Parse(String fileName)
		{
			using (var sr = new StreamReader(GetFileStream(fileName)))
			{
				_tok = new Tokenizer(sr);
				return Parse();
			}
		}

		Stream GetFileStream(String fileName)
		{
			if (fileName.EndsWith(".d"))
				fileName += ".ts";
			else if (!fileName.EndsWith(".d.ts"))
				fileName += ".d.ts";
			var fullPath = _reader.MakeFullPath(_path, fileName);
			return _reader.FileStreamFullPathRO(fullPath);
		}

		ModelMetadata Parse()
		{
			while (Next())
			{
				if (_tok.IsIderValue("export"))
				{
					Next();
					ReadExport();
				}
				else if (_tok.IsIderValue("import"))
				{
					Next();
					ReadImport();
				}
				else if (_tok.IsIderValue("declare"))
				{
					Next();
					ReadDeclare();
				}

			}
			return _mm;
		}

		void ReadExport()
		{
			if (_tok.IsIderValue("interface"))
			{
				Next();
				ReadInterface();
			}
		}

		void ReadDeclare()
		{
			if (_tok.IsIderValue("type"))
			{
				Next();
				ReadDeclareType();
			}
		}

		void ReadDeclareType()
		{
			var typeName = _tok.Value;
			Next();
			if (_tok.IsEqual)
			{
				Next();
				var type = ReadType();
				_mm.AddDeclare(typeName, type);
			}
		}

		Boolean Next()
		{
			if (!_tok.NextToken())
				return false;
			while (_tok.Token.Type == Token.TokenType.Comment)
			{
				if (!_tok.NextToken())
					return false;
			}
			return true;
		}

		void ReadImport()
		{
			List<String> types = new List<String>();
			ReadLeftCurly();
			while (!_tok.IsRightCurly && !_tok.IsEOF)
			{
				types.Add(_tok.Value);
				Next();
				if (_tok.IsComma)
					Next();
			}
			ReadRightCurly();
			if (_tok.IsIderValue("from"))
			{
				Next();
			}
			if (_tok.IsSemicolon)
				Next();
			var fileName = _tok.Value;
			// remove quotes
			fileName = fileName.Substring(1, fileName.Length - 2);
			ParseImport(fileName.ToLowerInvariant(), types);
		}

		void ParseImport(String fileName, IEnumerable<String> types)
		{
			var innerParser = new TSDefParser(_reader, _path);
			var mm = innerParser.Parse(fileName);
			foreach (var t in types)
			{
				if (mm.ContainsKey(t))
					_mm.Add(t, mm[t]);
			}
		}

		void ReadInterface()
		{
			var name = _tok.Token.Value;
			Next();
			TSType type = null;
			if (_tok.IsIderValue("extends"))
			{
				Next();
				type = ReadType();
			}
			var tm = _mm.AddType(name, type);
			ReadLeftCurly();
			ReadProps(tm);
			if (!_tok.IsRightCurly) // not read,check only
				throw new TSParserException("Expected '}'");
		}

		void ReadProps(TypeMetadata tm)
		{
			while (!_tok.IsRightCurly && !_tok.IsEOF)
			{
				var fieldName = _tok.Token.Value;
				Next();
				ReadColon();
				var type = ReadType();
				tm.AddField(fieldName, type);
				ReadSemicolon(error: false);
			}
		}

		TSType ReadType()
		{
			var fieldType = _tok.Value;
			Next();
			if (_tok.IsLessThen)
			{
				Next();
				var genericArg = _tok.Value;
				Next();
				ReadGreaterThen();
				return new TSType(fieldType, genericArg);
			}
			return new TSType(fieldType);
		}

		void ReadColon()
		{
			if (_tok.IsColon)
				Next();
			else
				throw new TSParserException("Expected ':'");
		}

		void ReadSemicolon(Boolean error = false)
		{
			if (_tok.IsSemicolon)
				Next();
			else if (error)
				throw new TSParserException("Expected ';'");
		}

		void ReadLeftCurly()
		{
			if (_tok.IsLeftCurly)
				Next();
			else
				throw new TSParserException("Expected '{'");
		}

		void ReadRightCurly()
		{
			if (_tok.IsRightCurly)
				Next();
			else
				throw new TSParserException("Expected '}'");
		}

		void ReadGreaterThen()
		{
			if (_tok.IsGreaterThen)
				Next();
			else
				throw new TSParserException("Expected '>'");
		}
	}
}
