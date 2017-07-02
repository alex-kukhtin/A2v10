// a2dockablepane.cpp : implementation file
//

#include "stdafx.h"
#include "../include/a2dockablepane.h"
#include "../include/a2glowborder.h"
#include "a2miniframewnd.h"
#include "../include/a2visualmanager.h"
#include "a2tabbedpane.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif

// CA2DockablePane

IMPLEMENT_SERIAL(CA2DockablePane, CDockablePane, 0)

CA2DockablePane::CA2DockablePane()
{

}

CA2DockablePane::~CA2DockablePane()
{
}


BEGIN_MESSAGE_MAP(CA2DockablePane, CDockablePane)
	ON_WM_PAINT()
	ON_WM_ERASEBKGND()
	ON_WM_SIZE()
	ON_WM_CREATE()
END_MESSAGE_MAP()


void CA2DockablePane::AdjustBorder(CRect& rectClient)
{
	if (IsDocked())
	{
		rectClient.left++;
		rectClient.right--;
		rectClient.bottom--;
	}
}

void CA2DockablePane::OnSize(UINT nType, int cx, int cy)
{
	__super::OnSize(nType, cx, cy);
	Invalidate();
}

int CA2DockablePane::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;

	m_pMiniFrameRTC = RUNTIME_CLASS(CA2MiniFrameWnd);
	m_pTabbedControlBarRTC = RUNTIME_CLASS(CA2TabbedPane);
	return 0L;
}

// afx_msg
void CA2DockablePane::OnPaint()
{
	CPaintDC dc(this);
	if (!IsDocked())
		return;
	CRect rc;
	GetClientRect(rc);
	auto pVm = DYNAMIC_DOWNCAST(CA2VisualManager, CMFCVisualManager::GetInstance());
	if (pVm == NULL)
		return;
	// Draw frame only. For tabs - special case
	auto pOldBrush = dc.SelectObject(pVm->GetDockedPaneBorderBrush());
	dc.PatBlt(rc.left, rc.top, 1, rc.Height() + 1, PATCOPY);
	dc.PatBlt(rc.left, rc.top, rc.Width(), 1, PATCOPY);
	dc.PatBlt(rc.right - 1, rc.top, 1, rc.Height() + 1, PATCOPY);
	if (!IsTabbed())
		dc.PatBlt(rc.left, rc.bottom - 1, rc.Width(), 1, PATCOPY);
	dc.SelectObject(pOldBrush);
	if (IsTabbed())
	{
		// for tabbed pane 
		pOldBrush = dc.SelectObject(&GetGlobalData()->brWindow);
		dc.PatBlt(rc.left + 1, rc.bottom - 1, rc.Width() - 2, 2, PATCOPY);
		dc.SelectObject(pOldBrush);
	}
}


// afx_msg
BOOL CA2DockablePane::OnEraseBkgnd(CDC* /*pDC*/)
{
	return TRUE;
}

