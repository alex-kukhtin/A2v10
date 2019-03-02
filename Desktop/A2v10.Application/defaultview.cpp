// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.


#include "stdafx.h"
// SHARED_HANDLERS can be defined in an ATL project implementing preview, thumbnail
// and search filter handlers and allows sharing of document code with that project.
#ifndef SHARED_HANDLERS
#include "A2v10.Application.h"
#endif

#include "defaultview.h"
#include "logindlg.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#define BG_BRUSH_LIGHT RGB(0xde, 0xe2, 0xed)
#define BG_BRUSH_NORMAL RGB(0xf2, 0xf3, 0xf9)

IMPLEMENT_DYNCREATE(CDefaultView, CView)

BEGIN_MESSAGE_MAP(CDefaultView, CView)
	ON_WM_ERASEBKGND()
	ON_COMMAND(ID_APP_START, OnStart)
END_MESSAGE_MAP()

CDefaultView::CDefaultView()
{
}

// virtual 
void CDefaultView::OnDraw(CDC* /*pDC*/)
{
	// do nothing
}

BOOL CDefaultView::PreCreateWindow(CREATESTRUCT& cs)
{
	cs.style &= ~WS_BORDER;
	return __super::PreCreateWindow(cs);
}

// afx_msg
BOOL CDefaultView::OnEraseBkgnd(CDC* pDC)
{
	ASSERT_VALID(pDC);

	CRect rectClient;
	GetClientRect(rectClient);

	CMFCVisualManager* pVM = CMFCVisualManager::GetInstance();
	if (pVM && pVM->OnEraseMDIClientArea(pDC, rectClient)) {
		return TRUE;
	}

	// Fill background with APPWORKSPACE
	CBrushSDC br(pDC, BG_BRUSH_NORMAL);
	CRect rect;
	pDC->GetClipBox(&rect);   // Erase the area needed
	pDC->PatBlt(rect.left, rect.top, rect.Width(), rect.Height(), PATCOPY);
	return TRUE;
}


// afx_msg
void CDefaultView::OnStart() 
{
	CFrameWnd* pFrame = GetParentFrame();
	ATLASSERT(pFrame);

	CLoginDlg dlg;
	if (dlg.DoModal() != IDOK) {
		pFrame->PostMessage(WM_SYSCOMMAND, SC_CLOSE);
		return;
	}

	pFrame->PostMessage(WM_COMMAND, ID_APP_LOAD);
}