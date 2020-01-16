// Copyright © 2008-2020 Alex Kukhtin. All rights reserved.

#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CConvert
{
public:
	static CString Color2String(COLORREF clr);
	static COLORREF String2Color(const wchar_t* szString, COLORREF clrDefault = UNKNOWN_COLOR);

	static CString Double2String(double d);
	static CString Long2String(long v);
	static long String2Long(const wchar_t* szString);

private:
	CConvert(void);  // declare only
	~CConvert(void); // declare only
};

#undef AFX_DATA
#define AFX_DATA
