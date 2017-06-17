

#include "stdafx.h"

#include "../include/appdefs.h"
#include "../include/guiext.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

// static
COLORREF CGdiTools::LightenColor(COLORREF col, double factor)
{
	if ((factor > 0.0) && (factor <= 1.0)) {
		BYTE R = GetRValue(col);
		BYTE G = GetGValue(col);
		BYTE B = GetBValue(col);
		BYTE LR = (BYTE)((factor * (255 - R)) + R);
		BYTE LG = (BYTE)((factor * (255 - G)) + G);
		BYTE LB = (BYTE)((factor * (255 - B)) + B);
		col = RGB(LR, LG, LB);
	}
	return col;
}

// static
COLORREF CGdiTools::DarkenColor(COLORREF col, double factor)
{
	if ((factor > 0.0) && (factor <= 1.0)) {
		BYTE R = GetRValue(col);
		BYTE G = GetGValue(col);
		BYTE B = GetBValue(col);
		BYTE LR = (BYTE)(R - (factor * R));
		BYTE LG = (BYTE)(G - (factor * G));
		BYTE LB = (BYTE)(B - (factor * B));
		col = RGB(LR, LG, LB);
	}
	return col;
}

// static 
COLORREF CGdiTools::InvertColor(COLORREF col)
{
	BYTE R = GetRValue(col);
	BYTE G = GetGValue(col);
	BYTE B = GetBValue(col);
	return RGB(255 - R, 255 - G, 255 - B);
}

// static
bool CGdiTools::IsBlackColor(COLORREF clr)
{
	// Петцольд. WPF. Базовый курс. стр. 281
	double R = (double)GetRValue(clr);
	double G = (double)GetGValue(clr);
	double B = (double)GetBValue(clr);
	return .222 * R + 0.707 * G + 0.071 * B > 128.0;
}

// static 
COLORREF CGdiTools::GetShadowBWColor(COLORREF clr)
{
	if ((GetRValue(clr) > 192) && (GetGValue(clr) > 192) && (GetBValue(clr) > 192))
		return afxGlobalData.clrBtnDkShadow;
	else
		return afxGlobalData.clrBtnHilite;
}
