// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CConvert
{
public:
	static CString Color2String(COLORREF clr);
	static COLORREF String2Color(LPCWSTR szString, COLORREF clrDefault = UNKNOWN_COLOR);

	static CString Double2String(double d);
	static CString Long2String(long v);

private:
	CConvert(void);  // declare only
	~CConvert(void); // declare only
};

#undef AFX_DATA
#define AFX_DATA
