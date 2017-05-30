
#include "stdafx.h"

#include "..\Include\appdefs.h"
#include "..\include\theme.h"
#include "resource.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


#define MASK_COLOR RGB(255, 0, 255)
// static 
CFont  CTheme::m_fonts[CTheme::FontTypeCount];
CImageList CTheme::m_imageLists[CTheme::ImageListCount];

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
	switch (ft) {
	case FontNonClient:
	{
		LOGFONT lf = { 0 };
		afxGlobalData.fontRegular.GetLogFont(&lf);

		NONCLIENTMETRICS info = { 0 };
		info.cbSize = sizeof(info);

		afxGlobalData.GetNonClientMetrics(info);

		lf.lfHeight = info.lfMenuFont.lfHeight;
		lf.lfWeight = info.lfMenuFont.lfWeight;
		lf.lfItalic = info.lfMenuFont.lfItalic;

		m_fonts[FontNonClient].CreateFontIndirect(&lf);
		return &m_fonts[FontNonClient];
	}
	break;
	case FontUiDefault :
	{
		LOGFONT lf = { 0 };
		afxGlobalData.fontRegular.GetLogFont(&lf);
		lf.lfHeight = lf.lfHeight * 75;
		m_fonts[FontUiDefault].CreateFontIndirect(&lf);
		return &m_fonts[FontUiDefault];
	}
	break;
	}
	ATLASSERT(FALSE);
	return nullptr;
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
	{ 0,			16, 16, MASK_COLOR },
	{ IDIL_10X10,	10, 10, MASK_COLOR },
};

// static 
CImageList* CTheme::GetImageList(ImageListType type /*= ImageList16x16*/)
{
	ATLASSERT(type >= 0 && type <= ImageListLast);
	CImageList* pList = &m_imageLists[type];
	if (pList->GetSafeHandle() == NULL) 
	{
		IL_DEF& id = ilDefs[type];
		CBitmap bmp;
		VERIFY(bmp.LoadBitmap(id.nID));
		pList->Create(id.iWidth, id.iHeight, ILC_COLOR24 | ILC_MASK, 0, 0);
		pList->Add(&bmp, id.clrMask);
	}
	ATLASSERT(pList->GetSafeHandle() != NULL);
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
