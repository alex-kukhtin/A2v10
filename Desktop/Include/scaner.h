// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

#pragma once


#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CTScaner
{
public:
	enum TokType {
		_tok_null,
		_tok_ider,
		_tok_equal,
		_tok_brakepart,
		_tok_semicolon,
		_tok_colon,
		_tok_string
	};
private:
	LPCWSTR m_szText;
	int m_index;
	int m_len;


	int m_tokstart;

	TokType m_tok;
	CString m_value;

public:

	CTScaner(LPCTSTR szText)
		: m_szText(szText),
		m_index(0), m_len(0),
		m_tokstart(0)
	{
		m_tok = _tok_null;
		m_len = lstrlen(m_szText);
		m_value.Preallocate(255);
	}

	bool NoMore() const { return Token() == _tok_null ? true : false;}

	TokType Token() const { return m_tok; }
	LPCWSTR Value() const { return (LPCWSTR)m_value; }
	bool NextToken();

	class CTException
	{
	};

protected:
	void GetIder(WCHAR c);
	void GetString(WCHAR c);
	WCHAR GetChar();
	void SkipBlanks();
	void UngetChar(TCHAR c);
	BOOL IsWhite(TCHAR c);
};

#undef AFX_DATA
#define AFX_DATA
