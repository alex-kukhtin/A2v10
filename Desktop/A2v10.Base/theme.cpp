// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

#include "stdafx.h"

#include "..\Include\appdefs.h"
#include "..\include\guiext.h"
#include "..\include\theme.h"
#include "resource.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


#define MASK_COLOR RGB(255, 0, 255)

// static 
CFont  CTheme::m_fonts[CTheme::FontTypeCount];
CImageList CTheme::m_imageLists[CTheme::ImageListCount];
COLORREF   CTheme::m_colors[CTheme::ColorCount] = { UNKNOWN_COLOR };

// static 
CFont* CTheme::GetUIFont(FontType ft/*= FontNormal*/)
{
	ATLASSERT(ft >= 0 && ft <= FontTypeLast);
	switch (ft) {
	case FontNormal:
		return &afxGlobalData.fontRegular;
		break;
	case FontBold:
		return &afxGlobalData.fontBold;
		break;
	case FontUnderline:
		return &afxGlobalData.fontUnderline;
		break;
	}
	if (m_fonts[ft].GetSafeHandle() != nullptr)
		return &(m_fonts[ft]);

	LOGFONT lf = { 0 };
	afxGlobalData.fontRegular.GetLogFont(&lf);

	switch (ft) {
	case FontNormal:
	case FontBold:
	case FontUnderline:
		// stubs. use std fonts
		ATLASSERT(FALSE);
		break;
	case FontBig:
		lf.lfHeight = (int)((double)lf.lfHeight * 9.75 / 8.25);
		break;
	case FontBigBold:
		lf.lfHeight = (int)((double)lf.lfHeight * 9.75 / 8.25);
		lf.lfWeight = 700;
		break;
	case FontUiDefault:
		lf.lfHeight = lf.lfHeight * 75;
		break;
	case FontNonClient:
		{
			NONCLIENTMETRICS info = { 0 };
			info.cbSize = sizeof(info);

			afxGlobalData.GetNonClientMetrics(info);

			lf.lfHeight = info.lfMenuFont.lfHeight;
			lf.lfWeight = info.lfMenuFont.lfWeight;
			lf.lfItalic = info.lfMenuFont.lfItalic;
		}
		break;
	case FontSmall:
		{
			lf.lfHeight = 675;
			HDC hDC = ::GetDC(NULL);
			POINT pt;
			// 72 points/inch, 10 decipoints/point
			pt.y = ::MulDiv(::GetDeviceCaps(hDC, LOGPIXELSY), lf.lfHeight, 7200);
			pt.x = 0;
			::DPtoLP(hDC, &pt, 1);
			POINT ptOrg = { 0, 0 };
			::DPtoLP(hDC, &ptOrg, 1);
			lf.lfHeight = -abs(pt.y - ptOrg.y);
			lf.lfQuality = CLEARTYPE_NATURAL_QUALITY; //  for small required
			::ReleaseDC(NULL, hDC);
		}
		break;
	}
	m_fonts[ft].CreateFontIndirect(&lf);
	ATLASSERT((HFONT)m_fonts[ft] != NULL);
	return &(m_fonts[ft]);
	ATLASSERT(FALSE);
	return nullptr;
}


// static 
int CTheme::GetFontHeight(FontType ft /*= FontNormal*/)
{
	CWindowDC dc(NULL);
	CThemeFontSDC font(&dc, ft);
	TEXTMETRIC tm = { 0 };
	dc.GetTextMetrics(&tm);
	return tm.tmHeight + tm.tmExternalLeading;
}

struct IL_DEF
{
	UINT nID;
	int  iWidth;
	int  iHeight;
	COLORREF clrMask;
};

static IL_DEF ilDefs[CTheme::ImageListCount] =
{
	{ IDIL_16x16,	16, 16, MASK_COLOR },
	{ IDIL_10X10,	10, 10, MASK_COLOR },
	{ IDIL_12X12,	12, 12, MASK_COLOR },
};

// static 
CImageList* CTheme::GetImageList(CTheme::ImageListType type /*= ImageList16x16*/)
{
	ATLASSERT(type >= 0 && type <= ImageListLast);
	CImageList* pList = &m_imageLists[(int) type];
	if (pList->GetSafeHandle() == nullptr) 
	{
		IL_DEF& id = ilDefs[type];
		CBitmap bmp;
		VERIFY(bmp.LoadBitmap(id.nID));
		VERIFY(pList->Create(id.iWidth, id.iHeight, ILC_COLOR24 | ILC_MASK, 0, 0));
		pList->Add(&bmp, id.clrMask);
	}
	ATLASSERT(pList->GetSafeHandle() != nullptr);
	return pList;
}

// static 
void CTheme::OnSettingChange()
{
	for (int i = 0; i < CTheme::FontTypeCount; i++) {
		if (m_fonts[i].GetSafeHandle()) {
			m_fonts[i].DeleteObject();
		}
	}
}

COLORREF CTheme::GetRealColor(ColorType ct)
{
	ATLASSERT((ct >= 0) && (ct < ColorCount));
	if (m_colors[0] == UNKNOWN_COLOR) {
		// initializing
		for (int i = ColorSystemFirst; i <= ColorSystemLast; i++) {
			m_colors[i] = ::GetSysColor(i);
		}
		m_colors[ColorBorder] = m_colors[ColorHighlight]; // RGB(176, 176, 192);
		m_colors[ColorRedNumbers] = RGB(224, 0, 0);
		m_colors[ColorBackground2] = CGdiTools::LightenColor(m_colors[ColorActiveCaption], 0.8);
		m_colors[ColorCaptionTop] = CGdiTools::LightenColor(m_colors[ColorHighlight], 0.45);
		m_colors[ColorCaptionBottom] = CGdiTools::DarkenColor(m_colors[ColorHighlight], 0.05);
		m_colors[ColorBtnFaceLight] = CGdiTools::LightenColor(m_colors[ColorBtnFace], 0.60);
		m_colors[ColorExcelSelect] = RGB(43, 23, 11); //RGB( 73,  53,  21); // from MS EXCEL
		m_colors[ColorDialogBorder] = RGB(127, 157, 185); // THEMES Dialog Border
		m_colors[ColorMask] = MASK_COLOR;
		m_colors[ColorBackSpecial] = RGB(255, 255, 213); // #ffffd5
		m_colors[ColorBackError] = RGB(255, 226, 228);
		m_colors[ColorBackWarning] = RGB(255, 241, 210);
		m_colors[ColorOutlineWarning] = RGB(253, 189, 40);
	}
	return m_colors[ct];
}
