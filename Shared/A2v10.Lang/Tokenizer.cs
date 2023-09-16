// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Linq;
using System.Text;

namespace A2v10.Lang
{
	public class Token
	{
		public enum TokenType
		{
			String,
			Number,
			Ider,
			RegExp,
			Comment,
			Delim
		}

		public TokenType Type { get; private set; }
		public String Value { get; private set; }
		public Boolean SpaceAfter => Type == TokenType.Ider && spaceAfter.Contains($"|{Value}|");
		public Boolean SpaceBeforeAndAfter => Type == TokenType.Ider && spaceBeforeAndAfter.Contains($"|{Value}|");

		public void SetToken(TokenType type, String value = null)
		{
			Type = type;
			Value = value;
		}

		public void SetValue(String value)
		{
			Value = value;
		}
		public void SetToken(TokenType type, Char ch)
		{
			Type = type;
			Value = new String(ch, 1);
		}

		const String spaceBeforeAndAfter = "|in|of|instanceof|";
		const String spaceAfter = "|var|let|const|return|case|async|await|function|new|typeof|interface|extends|throw|else|yield|delete|";
	}

	public class Tokenizer
	{
		const Char NULLCHAR = '\0';
		private readonly StreamReader _reader;
		Char _backward = NULLCHAR;
		private readonly Token _tok = new();

		public Tokenizer(StreamReader reader)
		{
			_reader = reader;
		}

		public Token Token => _tok;

		Char NextChar()
		{
			if (_backward != NULLCHAR)
			{
				Char ch = _backward;
				_backward = NULLCHAR;
				return ch;
			}
			if (_reader.EndOfStream)
				return NULLCHAR;
			return (Char)_reader.Read();

		}

		bool HasBackChar => _backward != NULLCHAR;

		void BackChar(Char ch)
		{
			if (_backward != NULLCHAR)
				throw new InvalidOperationException(nameof(BackChar));
			_backward = ch;
		}

		Boolean IsDelimiter(Char ch)
		{
			const String delims = "!#()[]{}=+-*/<>;:.,\\?|&^@%";
			return delims.Contains(ch);
		}

		public Boolean IsSemicolon => _tok.Type == Token.TokenType.Delim && _tok.Value == ";";
		public Boolean IsColon => _tok.Type == Token.TokenType.Delim && _tok.Value == ":";
		public Boolean IsIder => _tok.Type == Token.TokenType.Ider;
		public Boolean IsLeftCurly => _tok.Type == Token.TokenType.Delim && _tok.Value == "{";
		public Boolean IsRightCurly => _tok.Type == Token.TokenType.Delim && _tok.Value == "}";
		public Boolean IsComma => _tok.Type == Token.TokenType.Delim && _tok.Value == ",";
		public Boolean IsLessThen => _tok.Type == Token.TokenType.Delim && _tok.Value == "<";
		public Boolean IsGreaterThen => _tok.Type == Token.TokenType.Delim && _tok.Value == ">";
		public Boolean IsEqual => _tok.Type == Token.TokenType.Delim && _tok.Value == "=";

		public Boolean IsIderValue(String ider)
		{
			return _tok.Type == Token.TokenType.Ider && _tok.Value == ider;
		}

		public Boolean IsEOF => _reader.EndOfStream;
		public String Value => _tok.Value;

		public Boolean NextToken()
		{
			while (!_reader.EndOfStream || HasBackChar)
			{
				Char ch = NextChar();
				if (ch == '"' || ch == '\'' || ch == '`')
					return ReadString(ch);
				else if (Char.IsWhiteSpace(ch))
				{
					while (Char.IsWhiteSpace(ch))
					{
						ch = NextChar();
					}
					BackChar(ch);
				}
				else if (ch == '/')
				{
					Char next = NextChar();
					if (next == '/')
						return ReadSingleLineComment();
					else if (next == '*')
						return ReadMultiLineComment();
					else if (!Char.IsWhiteSpace(next))
						return ReadRegExp(ch, next);
					else
					{
						BackChar(next);
						_tok.SetToken(Token.TokenType.Delim, ch);
						return true;
					}
				}
				else if (ch == '.')
				{
					Char next = NextChar();
					if (Char.IsDigit(next))
						return ReadNumber(ch, next);
					else
					{
						BackChar(next);
						_tok.SetToken(Token.TokenType.Delim, ch);
						return true;
					}
				}
				else if (Char.IsDigit(ch))
				{
					return ReadNumber(ch);
				}
				else if (Char.IsLetter(ch) || ch == '$' || ch == '_')
				{
					return ReadIder(ch);
				}
				else if (IsDelimiter(ch))
				{
					_tok.SetToken(Token.TokenType.Delim, new string(ch, 1));
					return true;
				}
				else
					throw new InvalidOperationException($"Unrecognized char '{ch}'");
			}
			return false;
		}

		Boolean ReadSingleLineComment()
		{
			var sb = new StringBuilder();
			sb.Append("//");
			var ch = NextChar();
			while (ch != '\n' && ch != '\r' && ch != NULLCHAR)
			{
				sb.Append(ch);
				ch = NextChar();
			}
			_tok.SetToken(Token.TokenType.Comment, sb.ToString());
			return true;
		}

		Boolean ReadMultiLineComment()
		{
			var sb = new StringBuilder();
			sb.Append("/*");
			var ch = NextChar();
			while (ch != NULLCHAR)
			{
				sb.Append(ch);
				if (ch == '*')
				{
					Char next = NextChar();
					sb.Append(next);
					if (next == '/')
					{
						_tok.SetToken(Token.TokenType.Comment, sb.ToString());
						return true;
					}
				}
				ch = NextChar();
			}
			return false;
		}

		Boolean ReadIder(Char ch)
		{
			var sb = new StringBuilder();
			while (Char.IsLetterOrDigit(ch) || ch == '_' || ch == '$')
			{
				sb.Append(ch);
				ch = NextChar();
			}
			BackChar(ch);
			_tok.SetToken(Token.TokenType.Ider, sb.ToString());
			return true;
		}

		Boolean ReadString(Char quote)
		{
			var sb = new StringBuilder();
			sb.Append(quote);
			while (!_reader.EndOfStream)
			{
				Char ch = NextChar();
				sb.Append(ch);
				if (ch == '\\')
				{
					Char next = NextChar();
					sb.Append(next);
				}
				if (ch == quote)
				{
					_tok.SetToken(Token.TokenType.String, sb.ToString());
					return true;
				}
			}
			return false;
		}

		Boolean ReadRegExp(Char start, Char ch2)
		{
			var sb = new StringBuilder();
			sb.Append(start);
			sb.Append(ch2);
			if (ch2 == '\\')
				sb.Append(NextChar());
			while (!_reader.EndOfStream)
			{
				Char ch = NextChar();
				sb.Append(ch);
				if (ch == '\\')
				{
					Char next = NextChar();
					sb.Append(next);
				}
				if (ch == start)
				{
					Char next = NextChar();
					while (Char.IsLetter(next))
					{
						sb.Append(next);
						next = NextChar();
					}
					BackChar(next);
					_tok.SetToken(Token.TokenType.RegExp, sb.ToString());
					return true;
				}
			}
			return false;
		}

		Boolean ReadNumber(Char ch1, Char ch2 = NULLCHAR)
		{
			var sb = new StringBuilder();
			sb.Append(ch1);
			if (ch2 != NULLCHAR)
				sb.Append(ch2);
			Char ch = NextChar();
			while (Char.IsDigit(ch) || ch == 'E' || ch == 'e' || ch == '+' || ch == '-')
			{
				sb.Append(ch);
				ch = NextChar();
			}
			BackChar(ch);
			_tok.SetToken(Token.TokenType.Number, sb.ToString());
			return true;
		}
	}
}
