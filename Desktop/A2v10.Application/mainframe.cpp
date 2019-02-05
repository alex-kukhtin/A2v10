// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "A2v10.Application.h"

#include "mainframe.h"
#include "workarea.h"
#include "cefclient.h"
#include "cefview.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

// CMainFrame

IMPLEMENT_DYNCREATE(CMainFrame, CA2SDIFrameWnd)

BEGIN_MESSAGE_MAP(CMainFrame, CA2SDIFrameWnd)
	ON_WM_CREATE()
	ON_COMMAND(ID_FILE_CLOSE, &CMainFrame::OnFileClose)
	ON_WM_SYSCOMMAND()
END_MESSAGE_MAP()


// CMainFrame construction/destruction

CMainFrame::CMainFrame()
{
	// TODO: add member initialization code here
}

CMainFrame::~CMainFrame()
{
}

// virtual 
int CMainFrame::GetCaptionHeight() 
{
	// TODO: calc caption height
	return 42;
}

int CMainFrame::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;
	SetMenu(NULL);

	/*
	if (!m_wndMenuBar.Create(this))
	{
		TRACE0("Failed to create menubar\n");
		return -1;      // fail to create
	}
	*/

	//m_wndMenuBar.SetPaneStyle(m_wndMenuBar.GetPaneStyle() | CBRS_SIZE_DYNAMIC | CBRS_TOOLTIPS | CBRS_FLYBY);

	// prevent the menu bar from taking the focus on activation
	CMFCPopupMenu::SetForceMenuFocus(FALSE);

	CString strCustomize; // empty string required

	// TODO: Delete these five lines if you don't want the toolbar and menubar to be dockable
	//m_wndMenuBar.EnableDocking(CBRS_ALIGN_ANY);
	//m_wndToolBar.EnableDocking(CBRS_ALIGN_TOP);
	EnableDocking(CBRS_ALIGN_ANY);
	//DockPane(&m_wndMenuBar);
	//DockPane(&m_wndToolBar);


	// enable Visual Studio 2005 style docking window behavior
	CDockingManager::SetDockingMode(DT_SMART);
	// enable Visual Studio 2005 style docking window auto-hide behavior
	EnableAutoHidePanes(CBRS_ALIGN_ANY);

	CMFCToolBar::AddToolBarForImageCollection(IDR_MENU_IMAGES, IDR_MENU_IMAGES);
	// MFC BUG. Sets transparent color only when painting
	CMFCToolBarImages* pImages = CMFCToolBar::GetImages();
	pImages->SetTransparentColor(GetGlobalData()->clrBtnFace);


	// set the visual manager used to draw all user interface elements
	CMFCVisualManager::SetDefaultManager(RUNTIME_CLASS(CA2VisualManager));

	// Enable toolbar and docking window menu replacement
	//EnablePaneMenu(TRUE, ID_VIEW_CUSTOMIZE, strCustomize, ID_VIEW_TOOLBAR);

	ModifyStyle(0, FWS_PREFIXTITLE);

	CRect rc;
	GetWindowRect(&rc);
	SetWindowPos(NULL, rc.left, rc.top, rc.Width(), rc.Height(), SWP_FRAMECHANGED | SWP_NOZORDER);

	return 0;
}

BOOL CMainFrame::PreCreateWindow(CREATESTRUCT& cs)
{
	if( !__super::PreCreateWindow(cs) )
		return FALSE;
	// TODO: Modify the Window class or styles here by modifying
	//  the CREATESTRUCT cs

	return TRUE;
}

// CMainFrame diagnostics

#ifdef _DEBUG
void CMainFrame::AssertValid() const
{
	__super::AssertValid();
}

void CMainFrame::Dump(CDumpContext& dc) const
{
	__super::Dump(dc);
}
#endif //_DEBUG


// CMainFrame message handlers



BOOL CMainFrame::LoadFrame(UINT nIDResource, DWORD dwDefaultStyle, CWnd* pParentWnd, CCreateContext* pContext) 
{
	// base class does the real work

	if (!CFrameWndEx::LoadFrame(nIDResource, dwDefaultStyle, pParentWnd, pContext))
	{
		return FALSE;
	}

	CWinApp* pApp = AfxGetApp();
	if (pApp->m_pMainWnd == NULL)
		pApp->m_pMainWnd = this;

	return TRUE;
}

void CMainFrame::OnFileClose()
{
	DestroyWindow();
}

void CMainFrame::CreateNewView() 
{
	// примерно так
	UINT nViewId = AFX_IDW_PANE_FIRST + 10;
	CWnd* pActiveView = GetDlgItem(AFX_IDW_PANE_FIRST);
	CCreateContext ctx;
	ctx.m_pCurrentDoc = GetActiveDocument();
	ctx.m_pNewViewClass = RUNTIME_CLASS(CCefView);
	ctx.m_pCurrentFrame = this;
	CWnd* pNewView = CreateView(&ctx, nViewId);
	ATLASSERT(pNewView);
	::SetWindowLong(pActiveView->m_hWnd, GWL_ID, nViewId);
	::SetWindowLong(pNewView->m_hWnd, GWL_ID, AFX_IDW_PANE_FIRST);

	pActiveView->ShowWindow(SW_HIDE);
	RecalcLayout();

	OPEN_CEF_VIEW_INFO viewInfo;
	viewInfo.szUrl = L"https://www.google.com.ua";
	// send required
	pNewView->SendMessage(WMI_OPEN_CEF_VIEW, WMI_OPEN_CEF_VIEW_WPARAM, reinterpret_cast<LPARAM>(&viewInfo));
	SetActiveView(reinterpret_cast<CView*>(pNewView));
	pNewView->Invalidate();
}

// afx_msg
void CMainFrame::OnSysCommand(UINT nID, LPARAM lParam)
{
	if ((nID & 0xFFF0) == IDM_SYS_ABOUTBOX)
		PostMessage(WM_COMMAND, ID_APP_ABOUT);
	else if ((nID & 0xFFF0) == IDM_SYS_OPTIONS)
		PostMessage(WM_COMMAND, ID_TOOLS_OPTIONS);
	else if ((nID & 0xFFF0) == IDM_SYS_DEVTOOLS)
		CreateNewView();//PostMessage(WM_COMMAND, ID_SHOW_DEVTOOLS);
	else
		__super::OnSysCommand(nID, lParam);
}
