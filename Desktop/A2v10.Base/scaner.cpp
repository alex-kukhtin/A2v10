// Copyright © 2008-2020 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "../Include/appdefs.h"
#include "../Include/scaner.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif


WCHAR CTScaner::GetChar()
{
	if (m_index >= m_len)
		return NULL_CHR;
	return m_szText[m_index++];
}

void CTScaner::UngetChar(TCHAR c)
{
	if (c == NULL_CHR)
		return;
	if (m_index > 0 && m_index <= m_len)
		m_index--;
	else
		throw CTException();
}

void CTScaner::SkipBlanks()
{
	if (m_len == 0 || m_index >= m_len)
		return;
	TCHAR c = m_szText[m_index];
	if (c == NULL_CHR)
		return;
	while ((m_index < m_len - 1) && (IsWhite(c)))
		c = m_szText[++m_index];
	if (m_index == m_len - 1) {
		c = m_szText[m_index];
		if (IsWhite(c)) {
			m_index++;
		}
	}
}

BOOL CTScaner::IsWhite(TCHAR c) { 
	return (c == SPACE_CHR) || (c == TAB_CHR) || (c == CR_CHR) || (c == LF_CHR);
}

bool CTScaner::NextToken()
{
	m_tokstart = m_index;
	ATLASSERT(m_szText);
	m_tok = _tok_null;
	SkipBlanks();
	WCHAR c = GetChar();
	if (c == NULL_CHR)
		return false;
	// и пошли дальше
	if (c == L';') {
		m_tok = _tok_semicolon;
		return true;
	}
	else if (c == EQU_CHR) {
		m_tok = _tok_equal;
		return true;
	}
	else if (c == COLON_CHR) {
		m_tok = _tok_colon;
		return true;
	}
	else if (c == DQUOTE_CHR) {
		GetString(c);
	} 
	else  {
		GetIder(c);
	}
	return (Token() != _tok_null);
}

void CTScaner::GetIder(WCHAR c)
{
	m_value.Empty();
	m_tok = _tok_ider;
	m_value += c;
	c = GetChar();
	while (true) {
		if (c == NULL_CHR)
			break;
		if ((c == L';') || (c == EQU_CHR)) {
			UngetChar(c);
			break;
		}
		m_value += c;
		c = GetChar();
	}
}

void CTScaner::GetString(WCHAR c)
{
	m_value.Empty();
	m_tok = _tok_string;
	m_value += c;
	c = GetChar();
	while (true) {
		if (c == NULL_CHR)
			break;
		if (c == DQUOTE_CHR) {
			break;
		}
		m_value += c;
		c = GetChar();
	}
}
