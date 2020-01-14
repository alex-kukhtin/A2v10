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

// CMainFrame

IMPLEMENT_DYNCREATE(CMainFrame, CA2SDIFrameWndBase)

BEGIN_MESSAGE_MAP(CMainFrame, CA2SDIFrameWndBase)
	ON_WM_PAINT()
	ON_MESSAGE(WM_NCHITTEST, OnNcHitTest)
	ON_WM_NCMOUSEMOVE()
	ON_WM_NCMOUSELEAVE()
	ON_WM_NCLBUTTONDOWN()
	ON_MESSAGE_VOID(WM_IDLEUPDATECMDUI, OnIdleUpdateCmdUI)	
	ON_WM_CREATE()
	ON_MESSAGE(WMI_CEF_VIEW_COMMAND, OnCefViewCommand)
	ON_MESSAGE(WMI_CEF_TAB_COMMAND, OnCefTabCommand)
	ON_COMMAND(ID_FILE_CLOSE, OnFileClose)
	ON_WM_SYSCOMMAND()
	ON_UPDATE_COMMAND_UI_RANGE(IDM_SYS_FIRST, IDM_SYS_LAST, OnUpdateSysMenu)
	ON_COMMAND(ID_APP_TOOLS, OnAppTools)
	ON_WM_CLOSE()
	ON_WM_DESTROY()
	ON_COMMAND(ID_APP_LOAD, OnAppLoad)
END_MESSAGE_MAP()


// CMainFrame construction/destruction

CMainFrame::CMainFrame()
: m_nViewId(AFX_IDW_PANE_FIRST + 2), 
  m_captionButtons(IDMENU_TOOLS)
{
	// After create browser
// TODO:CEF
//m_navigateTabs.AddTab(EMPTYSTR, nullptr, m_nViewId);
}

CMainFrame::~CMainFrame()
{
}

int CMainFrame::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;
	SetMenu(NULL);

	CMFCPopupMenu::SetForceMenuFocus(FALSE);

	//EnableDocking(CBRS_ALIGN_ANY);


	// enable Visual Studio 2005 style docking window behavior
	//CDockingManager::SetDockingMode(DT_SMART);
	// enable Visual Studio 2005 style docking window auto-hide behavior
	//EnableAutoHidePanes(CBRS_ALIGN_ANY);

	CMFCToolBar::AddToolBarForImageCollection(IDR_MENU_IMAGES, IDR_MENU_IMAGES);
	// MFC BUG. Sets transparent color only when painting
	CMFCToolBarImages* pImages = CMFCToolBar::GetImages();
	pImages->SetTransparentColor(GetGlobalData()->clrBtnFace);

	CMFCVisualManager::SetDefaultManager(RUNTIME_CLASS(CA2VisualManager));

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



BOOL CMainFrame::LoadFrame(UINT nIDResource, DWORD dwDefaultStyle, CWnd* pParentWnd, CCreateContext* pContext) 
{
	// base class does the real work
	if (!__super::LoadFrame(nIDResource, dwDefaultStyle, pParentWnd, pContext))
		return FALSE;

	CWinApp* pApp = AfxGetApp();
	if (pApp->m_pMainWnd == nullptr)
		pApp->m_pMainWnd = this;

	if (m_navigateTabs.GetButtonsCount() == 0)
		return TRUE;

	// TODO:CEF
	CWnd* pActiveView = GetDlgItem(AFX_IDW_PANE_FIRST);
	CNavTab* pFirstTab = m_navigateTabs.GetTab(0);

	pFirstTab->SetHwnd(pActiveView->GetSafeHwnd());
	m_navigateTabs.SetActiveTab(pFirstTab);
	return TRUE;
}

void CMainFrame::OnFileClose()
{
	DestroyWindow();
}

void CMainFrame::CreateNewView(CEF_VIEW_INFO* pViewInfo)
{
	// примерно так
	UINT nViewId = ++m_nViewId;
	CWnd* pActiveView = GetDlgItem(AFX_IDW_PANE_FIRST);
	CCreateContext ctx;
	ctx.m_pCurrentDoc = GetActiveDocument();
	ctx.m_pNewViewClass = RUNTIME_CLASS(CCefView);
	ctx.m_pCurrentFrame = this;
	CWnd* pNewView = CreateView(&ctx, nViewId);
	ATLASSERT(pNewView);
	::SetWindowLong(pActiveView->m_hWnd, GWL_ID, nViewId);
	::SetWindowLong(pNewView->m_hWnd, GWL_ID, AFX_IDW_PANE_FIRST);

	CString title;
	VERIFY(title.LoadString(IDS_LOADING));
	m_navigateTabs.AddTab(title, pNewView->GetSafeHwnd(), nViewId);
	GetActiveDocument()->SetTitle(title);

	pActiveView->ShowWindow(SW_HIDE);
	RecalcLayout();
	// send required
	pNewView->SendMessage(WMI_CEF_VIEW_COMMAND, WMI_CEF_VIEW_COMMAND_OPEN, reinterpret_cast<LPARAM>(pViewInfo));
	SetActiveView(reinterpret_cast<CView*>(pNewView));
	pNewView->Invalidate();
	SetWindowPos(nullptr, 0, 0, 0, 0, SWP_NOZORDER | SWP_NOMOVE | SWP_NOSIZE | SWP_DRAWFRAME);
	PostMessage(WM_IDLEUPDATECMDUI, 0, 0);
	Invalidate(TRUE);
}

LRESULT CMainFrame::OnCefTabCommand(WPARAM wParam, LPARAM lParam)
{
	if (wParam == WMI_CEF_TAB_COMMAND_SELECT) {
		HWND targetHWnd = reinterpret_cast<HWND>(lParam);
		SwitchToTab(targetHWnd);
	}
	else if (wParam == WMI_CEF_TAB_COMMAND_CLOSING) {
	}
	else if (wParam == WMI_CEF_TAB_COMMAND_CLOSED) {
		HWND targetHWnd = reinterpret_cast<HWND>(lParam);
		CloseTab(targetHWnd);
	}
	else if (wParam == WMI_CEF_TAB_COMMAND_ISALLCLOSED) {
		if (m_navigateTabs.GetButtonsCount() == 0)
			PostMessage(WM_SYSCOMMAND, SC_CLOSE);
	}
	PostMessage(WM_IDLEUPDATECMDUI, 0, 0);
	return 0L;
}


void CMainFrame::SwitchToTab(HWND targetHWnd)
{
	CWnd* pActiveView = GetDlgItem(AFX_IDW_PANE_FIRST);
	HWND activeHwnd = pActiveView->GetSafeHwnd();
	if (activeHwnd == targetHWnd) {
		return;
	}
	CNavTab* pActiveTab = m_navigateTabs.FindTab(activeHwnd);
	if (!pActiveTab)
		return;
	CNavTab* pNewTab = m_navigateTabs.FindTab(targetHWnd);
	if (pNewTab)
		GetActiveDocument()->SetTitle(pNewTab->GetText());
	CWnd* pNewView = CWnd::FromHandle(targetHWnd);
	::SetWindowLong(pActiveView->m_hWnd, GWL_ID, pActiveTab->GetID());
	::SetWindowLong(pNewView->m_hWnd, GWL_ID, AFX_IDW_PANE_FIRST);
	pActiveView->ShowWindow(SW_HIDE);
	pNewView->ShowWindow(SW_SHOW);
	SetActiveView(reinterpret_cast<CView*>(pNewView));
	RecalcLayout();
	pNewView->Invalidate();
	m_navigateTabs.SetActiveTab(m_navigateTabs.FindTab(targetHWnd));
	Invalidate(TRUE);
}

void CMainFrame::CloseTab(HWND targetHWnd)
{
	CNavTab* pTab = m_navigateTabs.FindTab(targetHWnd);
	if (!pTab)
		return;
	if (!m_navigateTabs.RemoveTab(pTab, this))
		return;

	RecalcLayout();
	Invalidate();
}

// afx_msg
LRESULT CMainFrame::OnCefViewCommand(WPARAM wParam, LPARAM lParam)
{
	CEF_VIEW_INFO* pViewInfo = reinterpret_cast<CEF_VIEW_INFO*>(lParam);
	if (pViewInfo == nullptr)
		return 0L;
	if (!pViewInfo->szTitle && !pViewInfo->szUrl)
		return 0L;
	if (wParam == WMI_CEF_VIEW_COMMAND_CREATETAB) {
		if (!pViewInfo->szUrl)
			return 0L;
		CreateNewView(pViewInfo);
	}
	else if (wParam == WMI_CEF_VIEW_COMMAND_SETTILE) {
		if (!pViewInfo->szTitle)
			return 0L;
		CWnd* pWnd = GetDlgItem(AFX_IDW_PANE_FIRST);
		if (pWnd) {
			CString title(pViewInfo->szTitle);
			title.Replace(L"domain/", L"");
			CNavTab* pTab = m_navigateTabs.FindTab(pWnd->GetSafeHwnd());
			if (pTab && pTab->SetText(title)) {
				GetActiveDocument()->SetTitle(title);
				RecalcLayout();
				Invalidate();
			}
		}
	}
	PostMessage(WM_IDLEUPDATECMDUI, 0, 0);
	return 0L;
}

// afx_msg
void CMainFrame::OnSysCommand(UINT nID, LPARAM lParam)
{
	if ((nID & 0xFFF0) == IDM_SYS_ABOUTBOX)
		PostMessage(WM_COMMAND, ID_APP_ABOUT);
	else if ((nID & 0xFFF0) == IDM_SYS_OPTIONS)
		PostMessage(WM_COMMAND, ID_TOOLS_OPTIONS);
	else if ((nID & 0xFFF0) == IDM_SYS_DEVTOOLS)
		PostMessage(WM_COMMAND, ID_SHOW_DEVTOOLS);
	else
		__super::OnSysCommand(nID, lParam);
}

// afx_msg
void CMainFrame::OnUpdateSysMenu(CCmdUI* pCmdUI)
{
	pCmdUI->Enable(TRUE);
}

// afx_msg
void CMainFrame::OnAppTools() {
	auto navRect = m_captionButtons.GetRect();
	ClientToScreen(navRect);
	CUITools::TrackPopupMenu(IDM_POPUP_APPTOOLS, 0, this, CPoint(navRect.left + SYSBTNS_HEIGHT, navRect.bottom), true /*alignRight*/);
}

// afx_msg
void CMainFrame::OnClose()
{
	if (m_navigateTabs.GetButtonsCount() > 0) {
		m_navigateTabs.CloseAllTabs();
		return;
	}
	ShowWindow(SW_HIDE);
	__super::OnClose();
}

// afx_msg
void CMainFrame::OnDestroy()
{
	__super::OnDestroy();
}

// afx_msg
void CMainFrame::OnAppLoad()
{
	CEF_VIEW_INFO viewInfo;
	CString strUrl = L"http://domain";
	if (!theApp.m_strInitialUrl.IsEmpty()) {
		strUrl += L"/";
		strUrl += theApp.m_strInitialUrl;
	}
	viewInfo.szUrl = strUrl;
	HWND hFrame = GetSafeHwnd();
	::SendMessage(hFrame, WMI_CEF_VIEW_COMMAND, WMI_CEF_VIEW_COMMAND_CREATETAB, reinterpret_cast<LPARAM>(&viewInfo));
}

// afx_msg
void CMainFrame::OnIdleUpdateCmdUI()
{
	CWnd* pActiveWnd = GetDlgItem(AFX_IDW_PANE_FIRST);
	if (!pActiveWnd)
		return;
	LRESULT lr = pActiveWnd->SendMessage(WMI_CEF_IDLE_UPDATE_BUTTONS, WMI_CEF_IDLE_UPDATE_WPARAM_NAVIGATE);
	bool canBack = LOWORD(lr) != 0;
	bool canForward = HIWORD(lr) != 0;
	bool r1 = m_navigateButtons.DisableButton(0 /*BACK*/, !canBack);
	bool r2 = m_navigateButtons.DisableButton(1/*FORWARD*/, !canForward);
	if (r1 || r2) {
		//Invalidate();
		InvalidateRect(CRect(0, 0, 32767, GetCaptionHeight()));
	}
}