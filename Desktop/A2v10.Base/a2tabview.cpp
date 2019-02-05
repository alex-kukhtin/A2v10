// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"

#include "../Include/a2tabview.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif


IMPLEMENT_DYNCREATE(CA2TabView, CTabView)

BEGIN_MESSAGE_MAP(CA2TabView, CTabView)
	ON_WM_CREATE()
	ON_WM_SIZE()
END_MESSAGE_MAP()

CA2TabView::CA2TabView()
{
}

CA2TabView::~CA2TabView()
{
}

// virtual 
BOOL CA2TabView::IsScrollBar() const 
{ 
	return FALSE; 
}

int CA2TabView::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	// skip base class
	if (CView::OnCreate(lpCreateStruct) == -1)
		return -1;

	ModifyStyleEx(WS_EX_CLIENTEDGE, 0, 0);

	CRect rectDummy;
	rectDummy.SetRectEmpty();

	// Create tabs window:
	if (!m_wndTabs.Create(
		IsScrollBar() ? CMFCTabCtrl::STYLE_FLAT_SHARED_HORZ_SCROLL : CMFCTabCtrl::STYLE_3D, 
		rectDummy, this, 1))
	{
		TRACE0("Failed to create tab window\n");
		return -1;      // fail to create
	}

	OnCreate();
	m_wndTabs.SetFlatFrame();
	m_wndTabs.SetTabBorderSize(0);
	m_wndTabs.AutoDestroyWindow(FALSE);
	return 0;
}


// afx_msg
void CA2TabView::OnSize(UINT nType, int cx, int cy)
{
	__super::OnSize(nType, cx, cy);
}

// virtual 
void CA2TabView::OnCreate()
{

}


