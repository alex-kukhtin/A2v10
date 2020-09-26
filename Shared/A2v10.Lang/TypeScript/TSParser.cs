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

	public class TSParser
	{
		private readonly Tokenizer _tok;
		private readonly ModelMetadata _mm;

		private TSParser(StreamReader reader)
		{
			_tok= new Tokenizer(reader);
			_mm = new ModelMetadata();
		}

		public static void Parse(String fileName)
		{
			using (var sr = new StreamReader(fileName, Encoding.UTF8))
			{
				Parse(sr);
			}
		}

		public static ModelMetadata Parse(Stream stream)
		{
			using (var sr = new StreamReader(stream))
			{
				return Parse(sr);
			}
		}

		public static ModelMetadata Parse(StreamReader reader)
		{
			var parser = new TSParser(reader);
			return parser.Parse();
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
			}
			return _mm;
		}

		void ReadExport()
		{
			if (_tok.IsIderValue("interface"))
			{
				Next();
				ReadInterface();
			} else if (_tok.IsIderValue("import"))
			{
				Next();
				ReadImport();
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
				if (_tok.IsComma)
					Next();
			}
			ReadRightCurly();
			if (_tok.IsIderValue("from"))
			{
				Next();
			}
			var fileName = _tok.Value;
			int z = 55;
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
