// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Infrastructure.Utilities
{
	[Serializable]
	public class ParseError : Exception
	{
		public ParseError(String msg)
			: base(msg)
		{

		}
	}

	public class Tokenizer
	{

		public enum TokenId
		{
			Null,
			OpenParen,
			CloseParen,
			StringLiteral,
			Identifier,
			IntegerLiteral,
			RealLiteral,
			End,
			Asterisk,
			Plus,
			Minus,
			Slash,
			Dot,
			Comma
		}

		public struct Token
		{
			public TokenId id;
			public String Text;
			public Int32 pos;

			public String UnquotedText
			{
				get
				{
					if (id == TokenId.StringLiteral)
						return Text.Substring(1, Text.Length - 2);
					return Text;
				}
			}
		}

		String text = null;
		Int32 textPos = 0;
		readonly Int32 textLen = 0;
		Char ch;

		public Token token;

		public Tokenizer(String source, Int32 textPos = 0)
		{
			text = source;
			textLen = text.Length;
			SetTextPos(textPos);
			NextToken();
		}

		public Int32 GetTextPos()
		{
			return textPos;
		}

		void SetTextPos(Int32 pos)
		{
			textPos = pos;
			ch = textPos < textLen ? text[textPos] : '\0';
		}

		void NextChar()
		{
			if (textPos < textLen) textPos++;
			ch = textPos < textLen ? text[textPos] : '\0';
		}

		void PrevChar()
		{
			if (textPos > 0) textPos--;
			ch = textPos > 0 ? text[textPos] : '\0';
		}

		Boolean IsCrLf()
		{
			return ch == '\r' || ch == '\n';
		}
		void ValidateDigit()
		{
			if (!Char.IsDigit(ch))
				throw new ParseError($"Digit Expected. pos:{textPos}");
		}

		public void NextToken()
		{
			while (Char.IsWhiteSpace(ch)) NextChar();
			Int32 tokenPos = textPos;
			TokenId t = TokenId.Null;
			switch (ch)
			{
				case '(':
					NextChar();
					t = TokenId.OpenParen;
					break;
				case ')':
					NextChar();
					t = TokenId.CloseParen;
					break;
				case '.':
					NextChar();
					t = TokenId.Dot;
					break;
				case '*':
					NextChar();
					t = TokenId.Asterisk;
					break;
				case '+':
					NextChar();
					t = TokenId.Plus;
					break;
				case '-':
					NextChar();
					t = TokenId.Minus;
					break;
				case ',':
					NextChar();
					t = TokenId.Comma;
					break;
				case '"':
				case '\'':
					Char quote = ch;
					do
					{
						NextChar();
						while (textPos < textLen && ch != quote) NextChar();
						if (textPos == textLen)
							throw new ParseError($"Unterminated string literal. pos : {textPos}");
						NextChar();
					} while (ch == quote);
					t = TokenId.StringLiteral;
					break;
				case '/':
					NextChar();
					if (ch == '*')
					{
						do
						{
							NextChar();
							while (textPos < textLen && ch != '*')
								NextChar();
							if (textPos == textLen)
								throw new ParseError($"Unterminated comment. pos : {textPos}");
							NextChar();
							if (ch == '/')
							{
								NextChar();
								NextToken();
								return;
							}
						} while (true);
					}
					else if (ch == '/')
					{
						do
						{
							NextChar();
							while (textPos < textLen && !IsCrLf())
								NextChar();
							if (textPos == textLen)
							{
								token.id = TokenId.End;
								return;
							}
							NextChar();
							if (IsCrLf())
								NextChar();
							NextToken();
							return;
						} while (true);
					}
					else
					{
						t = TokenId.Slash;
						break;
					}
				default:
					if (Char.IsLetter(ch) || ch == '@' || ch == '_')
					{
						do
						{
							NextChar();
						} while (Char.IsLetterOrDigit(ch) || ch == '_');
						t = TokenId.Identifier;
						break;
					}
					if (Char.IsDigit(ch))
					{
						t = TokenId.IntegerLiteral;
						do
						{
							NextChar();
						} while (Char.IsDigit(ch));
						if (ch == '.')
						{
							t = TokenId.RealLiteral;
							NextChar();
							ValidateDigit();
							do
							{
								NextChar();
							} while (Char.IsDigit(ch));
						}
						if (ch == 'E' || ch == 'e')
						{
							t = TokenId.RealLiteral;
							NextChar();
							if (ch == '+' || ch == '-') NextChar();
							ValidateDigit();
							do
							{
								NextChar();
							} while (Char.IsDigit(ch));
						}
						if (ch == 'F' || ch == 'f') NextChar();
						break;
					}
					if (textPos == textLen)
					{
						t = TokenId.End;
						break;
					}
					throw new ParseError($"Invalid character. ch : {ch}, pos : {textPos}");
			}
			token.id = t;
			token.Text = text.Substring(tokenPos, textPos - tokenPos);
			token.pos = tokenPos;
		}
	}
}
