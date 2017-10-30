// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

#include "stdafx.h"

#include "..\include\appdefs.h"
#include "..\include\appstructs.h"
#include "..\include\guiext.h"
#include "..\include\theme.h"
#include "..\include\guictrls.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

// CTitleCtrl
BEGIN_MESSAGE_MAP(CTitleCtrl, CStatic)
	ON_WM_PAINT()
END_MESSAGE_MAP()

// afx_msg
void CTitleCtrl::OnPaint()
{
	CPaintDC dc(this);
	dc.SetBkMode(TRANSPARENT);

	CRect rc;
	GetClientRect(&rc);

	COLORREF clr = RGB(0x44, 0x99, 0xFF); // %%%%% THEMES DIALOG BORDER ???
	CBrushSDC br(&dc, clr);
	dc.PatBlt(rc.left, rc.bottom - 1, rc.Width(), 1, PATCOPY);
	rc.bottom--;

	CThemeFontSDC font(&dc, CTheme::FontBold);
	CString str;
	GetWindowText(str);
	dc.DrawText(str, rc, DT_TOP | DT_SINGLELINE);
}


// CInfoMsgCtrl

BEGIN_MESSAGE_MAP(CInfoMsgCtrl, CStatic)
	ON_WM_PAINT()
END_MESSAGE_MAP()

// afx_msg
void CInfoMsgCtrl::OnPaint()
{
	CPaintDC dc(this);
	dc.SetBkMode(TRANSPARENT);

	CRect rc;
	GetClientRect(&rc);
	dc.FillSolidRect(rc, CTheme::GetRealColor(CTheme::ColorInfoBk));
	COLORREF clrBk = CTheme::GetRealColor(CTheme::ColorBtnShadow);
	dc.Draw3dRect(rc, clrBk, clrBk);
	rc.DeflateRect(2, 2);
	CImageList* pIL = CTheme::GetImageList(CTheme::ImageList12x12);
	int iImage = (m_type == _tti_info) ? 1 :
		(m_type == _tti_warning) ? 2 :
		(m_type == _tti_error) ? 3 : 2; // unknown is warning
	CPoint pt(rc.TopLeft());
	pt.Offset(1, 1);
	pIL->Draw(&dc, iImage, pt, ILD_TRANSPARENT);
	rc.left += 15;
	CThemeFontSDC font(&dc);
	CString str;
	GetWindowText(str);
	dc.DrawText(str, rc, DT_LEFT | DT_TOP | DT_WORDBREAK);
}
