// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.


#include "stdafx.h"
#include "..\include\appdefs.h"
#include "..\include\convert.h"

// static 
CString CConvert::Color2String(COLORREF clr)
{
	CString s;
	s.Format(L"#%02x%02x%02x", GetRValue(clr), GetGValue(clr), GetBValue(clr));
	return s;
}
// static 
COLORREF CConvert::String2Color(LPCWSTR szString, COLORREF clrDefault /*= UNKNOWN_COLOR*/)
{
	CString s(szString);
	s.Trim();
	s.MakeLower();
	if (s.IsEmpty())
		return clrDefault;
	if (s.GetAt(0) == L'#') {
		// HEX value
		if (s.GetLength() == 7)
		{
			int r = 0; int g = 0; int b = 0;
			if (swscanf_s((LPCWSTR)s + 1, L"%02x%02x%02x", &r, &g, &b) != 3)
				return clrDefault;
			COLORREF clr = RGB((BYTE)r, (BYTE)g, (BYTE)b);
			return clr;
		}
		else if (s.GetLength() == 4)
		{
			int r = 0; int g = 0; int b = 0;
			if (swscanf_s((LPCWSTR)s + 1, L"%01x%01x%01x", &r, &g, &b) != 3)
				return clrDefault;
			r = r | (r << 4);
			g = g | (g << 4);
			b = b | (b << 4);

			COLORREF clr = RGB((BYTE)r, (BYTE)g, (BYTE)b);
			return clr;
		}
	}
	return clrDefault;
}

// static 
CString CConvert::Double2String(double d)
{
#ifndef PVS_STUDIO
	if (d == 0.0)
		return L"0";
#endif
	CString s;
	s.Format(L"%lf", d);
	int len = s.GetLength();
	LPWSTR v = s.GetBuffer(len + 1);
	while (len > 0 && *(v + len - 1) == L'0')
		len--;
	if (len > 0 && *(v + len - 1) == DOT_CHR)
		len--; // remove dot (if tail)
	s.ReleaseBuffer(len);
	return s;
}


//static
CString CConvert::Long2String(long v) {
	CString s;
	s.Format(L"%ld", v);
	return s;
}