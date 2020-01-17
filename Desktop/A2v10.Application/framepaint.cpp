// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "A2v10.Application.h"

#include "navtabs.h"
#include "consolewnd.h"
#include "mainframe.h"
#include "workarea.h"
#include "cefclient.h"
#include "cefview.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif



#define BG_BRUSH_NORMAL RGB(0xf2, 0xf3, 0xf9)

/*

*/

// virtual 
int CMainFrame::GetCaptionHeight()
{
	// TODO: calc caption height
	return TAB_HEIGHT + TOP_GAP + BOTTOM_GAP;
}


// virtual 
void CMainFrame::RecalcLayout(BOOL bNotify /*= TRUE*/)
{
	if (m_bInRecalcLayout)
		return;
	CRect winRect(0, 0, 200, 200);
	AdjustWindowRectEx(winRect, WS_OVERLAPPEDWINDOW, FALSE, WS_EX_APPWINDOW);
	m_nDelta8 = (winRect.Width() - 200) / 2;
	BOOL bZoomed = IsZoomed(); // GetStyle() & WS_MAXIMIZE;
	CRect clientRect;
	GetClientRect(clientRect);
	int cyCaption = GetCaptionHeight();
	CRect captionRect = clientRect;
	CRect navigateRect = clientRect;
	CRect tabsRect = clientRect;
	captionRect.bottom = captionRect.top + SYSBTNS_HEIGHT;
	navigateRect.top += TOP_GAP;
	navigateRect.left += LEFT_GAP;
	navigateRect.bottom = navigateRect.top + TAB_HEIGHT;
	tabsRect.top += TOP_GAP;
	tabsRect.bottom = tabsRect.top + TAB_HEIGHT;
	if (bZoomed) {
		m_dockManager.m_rectInPlace = clientRect;
		m_dockManager.m_rectInPlace.DeflateRect(m_nDelta8, cyCaption + m_nDelta8, m_nDelta8, m_nDelta8);
		captionRect.OffsetRect(-m_nDelta8, m_nDelta8);
		navigateRect.OffsetRect(m_nDelta8, m_nDelta8);
		tabsRect.OffsetRect(m_nDelta8, m_nDelta8);
		m_captionButtons.RecalcLayout(captionRect, bZoomed);
		m_navigateButtons.RecalcLayout(navigateRect, bZoomed);
		tabsRect.left += m_navigateButtons.Width() + LEFT_GAP;
		tabsRect.right -= m_captionButtons.Width();
		m_navigateTabs.RecalcLayout(tabsRect, bZoomed);
		__super::RecalcLayout(bNotify);
		return;
	}
	m_dockManager.m_rectInPlace = clientRect;
	// caption only!!!
	m_dockManager.m_rectInPlace.DeflateRect(0, cyCaption, 0, 0);
	m_captionButtons.RecalcLayout(captionRect, bZoomed);
	m_navigateButtons.RecalcLayout(navigateRect, bZoomed);
	tabsRect.left += m_navigateButtons.Width() + LEFT_GAP;
	tabsRect.right -= m_captionButtons.Width();
	m_navigateTabs.RecalcLayout(tabsRect, bZoomed);
	__super::RecalcLayout(bNotify);

}

// afx_msg 
LRESULT CMainFrame::OnNcHitTest(WPARAM wParam, LPARAM lParam)
{
	CPoint clientPt(lParam);
	ScreenToClient(&clientPt);

	//??? HTSYSMENU;

	int cyCaption = GetCaptionHeight();
	if (m_captionButtons.GetRect().PtInRect(clientPt))
		return HTOBJECT;
	else if (m_navigateButtons.GetRect().PtInRect(clientPt))
		return HTOBJECT;
	else if (m_navigateTabs.GetRect().PtInRect(clientPt))
		return HTOBJECT;
	else if (clientPt.y < cyCaption)
		return HTCAPTION;
	return HTNOWHERE;
}


// afx_msg
void CMainFrame::OnPaint()
{
	CPaintDC dc(this);

	CDC* pDC = &dc;
	BOOL bMemDC = false;
	CDC dcMem;
	CBitmap bmp;
	CBitmap* pOldBmp = nullptr;

	CRect rectWindow;
	GetWindowRect(rectWindow);
	CRect rect;
	rect.SetRect(0, 0, rectWindow.Width(), rectWindow.Height());

	if (dcMem.CreateCompatibleDC(&dc) && bmp.CreateCompatibleBitmap(&dc, rect.Width(), rect.Height()))
	{
		// Off-screen DC successfully created. Better paint to it then!
		bMemDC = true;
		pOldBmp = dcMem.SelectObject(&bmp);
		pDC = &dcMem;
	}

	DoPaint(*pDC);

	if (bMemDC)
	{
		// Copy the results to the on-screen DC:
		CRect rectClip;
		int nClipType = dc.GetClipBox(rectClip);
		if (nClipType != NULLREGION)
		{
			if (nClipType != SIMPLEREGION)
				rectClip = rect;

			dc.BitBlt(rectClip.left, rectClip.top, rectClip.Width(), rectClip.Height(), &dcMem, rectClip.left, rectClip.top, SRCCOPY);
		}
		dcMem.SelectObject(pOldBmp);
	}
}

void CMainFrame::DoPaint(CDC& dc)
{
	CRect rc;
	GetClientRect(rc);

	BOOL bMax = IsZoomed();

	int cyCaption = GetCaptionHeight();
	int dxIcon = (cyCaption - 24) / 2;
	int iconOrigin = 0;

	CRect captionRect(rc.left, rc.top, rc.right, rc.top + cyCaption);
	if (bMax) {
		captionRect.OffsetRect(m_nDelta8, m_nDelta8);
		iconOrigin = m_nDelta8;
	}

	auto pVm = DYNAMIC_DOWNCAST(CA2VisualManager, CMFCVisualManager::GetInstance());
	if (pVm)
		dc.FillRect(captionRect, pVm->GetWindowCaptionBackgroundBrush());
	
	dc.SetBkMode(TRANSPARENT);

	CRect tabRect(captionRect);
	CBrushSDC tabBrush(&dc, BG_BRUSH_NORMAL);
	tabRect.top += TAB_HEIGHT + TOP_GAP;
	dc.FillRect(tabRect, &tabBrush);

	m_captionButtons.Draw(&dc);
	m_navigateButtons.Draw(&dc);
	m_navigateTabs.Draw(&dc);
}

// afx_msg 
void CMainFrame::OnNcMouseMove(UINT nHitTest, CPoint point)
{
	__super::OnNcMouseMove(nHitTest, point);
	if (nHitTest == HTOBJECT) {
		ScreenToClient(&point);
		if (m_captionButtons.MouseMove(point))
			InvalidateRect(m_captionButtons.GetRect());
		else if (m_navigateButtons.MouseMove(point))
			InvalidateRect(m_navigateButtons.GetRect());
		else if (m_navigateTabs.MouseMove(point))
			InvalidateRect(m_navigateTabs.GetRect());
	}
	else {
		if (m_captionButtons.ClearHighlight())
			InvalidateRect(m_captionButtons.GetRect());
		else if (m_navigateButtons.ClearHighlight())
			InvalidateRect(m_navigateButtons.GetRect());
		else if (m_navigateTabs.ClearHighlight())
			InvalidateRect(m_navigateTabs.GetRect());
	}
}

// afx_msg 
void CMainFrame::OnNcMouseLeave()
{
	__super::OnNcMouseLeave();
	if (m_captionButtons.ClearHighlight())
		InvalidateRect(m_captionButtons.GetRect());
	else if (m_navigateButtons.ClearHighlight())
		InvalidateRect(m_navigateButtons.GetRect());
	else if (m_navigateTabs.ClearHighlight())
		InvalidateRect(m_navigateTabs.GetRect());
}

// afx_msg
void CMainFrame::OnNcLButtonDown(UINT nHitTest, CPoint point)
{
	__super::OnNcLButtonDown(nHitTest, point);
	if (nHitTest == HTOBJECT) {
		ScreenToClient(&point);
		if (m_captionButtons.PressButton(point, this)) return;
		if (m_navigateButtons.PressButton(point, this)) return;
		if (m_navigateTabs.PressButton(point, this)) return;
	}
}
