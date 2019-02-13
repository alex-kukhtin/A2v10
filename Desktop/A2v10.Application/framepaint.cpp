// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "A2v10.Application.h"

#include "navtabs.h"
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


	/*
	CFont* pOldFont = dc.SelectObject(CTheme::GetUIFont(CTheme::FontNonClient));
	CPenSDC  tabPen(&dc, RGB(0xaf, 0xaf, 0xaf));
	CRect tabRect(captionRect);
	tabRect.top += TAB_HEIGHT + TOP_GAP;
	//tabRect.right = tabRect.left + 80;
	dc.FillRect(tabRect, &tabBrush);

	tabRect.CopyRect(captionRect);
	tabRect.left += m_navigateButtons.Width() + LEFT_GAP;
	tabRect.right = tabRect.left + 200; /*MAX_TAB_WIDTH* /
	tabRect.bottom -= BOTTOM_GAP;
	tabRect.top += TOP_GAP;
	dc.FillRect(tabRect, &tabBrush);
	dc.MoveTo(tabRect.left, tabRect.top);
	//dc.LineTo(tabRect.left, tabRect.bottom);
	dc.MoveTo(tabRect.right-1, tabRect.top);
	//dc.LineTo(tabRect.right-1, tabRect.bottom);
	tabRect.OffsetRect(16, 0);
	dc.DrawText(L"Покупатели", &tabRect, DT_SINGLELINE | DT_LEFT | DT_VCENTER);
	dc.MoveTo(tabRect.right + 100, tabRect.top + 4);
	dc.LineTo(tabRect.right + 100, tabRect.bottom - 4);
	dc.SelectObject(pOldFont);
	*/
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
