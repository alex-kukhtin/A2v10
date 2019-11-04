// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.


#include "stdafx.h"
// SHARED_HANDLERS can be defined in an ATL project implementing preview, thumbnail
// and search filter handlers and allows sharing of document code with that project.
#ifndef SHARED_HANDLERS
#include "A2v10.Application.h"
#endif

#include "workarea.h"
#include "cefclient.h"
#include "cefview.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// CCefView

IMPLEMENT_DYNCREATE(CCefView, CView)

BEGIN_MESSAGE_MAP(CCefView, CView)
	ON_MESSAGE(WMI_CEF_IDLE_UPDATE_BUTTONS, OnIdleUpdateButtons)
	ON_WM_SIZE()
	ON_WM_ERASEBKGND()
	ON_MESSAGE(WMI_CEF_VIEW_COMMAND, OnOpenCefView)
	ON_MESSAGE(WMI_CEF_TAB_COMMAND, OnCefTabCommand)
	ON_WM_CONTEXTMENU()
	ON_WM_RBUTTONUP()
	ON_WM_CLOSE()
	ON_COMMAND(ID_NAVIGATE_REFRESH, OnReload)
	ON_COMMAND(ID_NAVIGATE_REFRESH_IGNORE_CACHE, OnReloadIgnoreCache)
	ON_COMMAND(ID_SHOW_DEVTOOLS, OnShowDevTools)
	ON_MESSAGE(WM_APPCOMMAND, OnAppCommand)
	ON_COMMAND(ID_NAVIGATE_BACK, OnNavigateBack)
	ON_COMMAND(ID_NAVIGATE_FORWARD, OnNavigateForward)
	ON_WM_DESTROY()
	ON_WM_SETFOCUS()
END_MESSAGE_MAP()

// CCefView construction/destruction

CCefView::CCefView()
{
	// TODO: add construction code here

}

CCefView::~CCefView()
{
	if (m_clientHandler != nullptr)
		m_clientHandler->DetachDelegate();
	m_clientHandler = nullptr;
}

// afx_msg
BOOL CCefView::OnEraseBkgnd(CDC* pDC)
{
	return TRUE;
}

BOOL CCefView::PreCreateWindow(CREATESTRUCT& cs)
{
	// TODO: Modify the Window class or styles here by modifying
	//  the CREATESTRUCT cs
	if (!__super::PreCreateWindow(cs))
		return FALSE;
	cs.dwExStyle &= ~WS_EX_CLIENTEDGE;
	return TRUE;
}

// CCefView drawing

void CCefView::OnDraw(CDC* /*pDC*/)
{
	// do nothing
}


// CCefView printing


void CCefView::OnFilePrintPreview()
{
#ifndef SHARED_HANDLERS
	AFXPrintPreview(this);
#endif
}

BOOL CCefView::OnPreparePrinting(CPrintInfo* pInfo)
{
	// default preparation
	return DoPreparePrinting(pInfo);
}

void CCefView::OnBeginPrinting(CDC* /*pDC*/, CPrintInfo* /*pInfo*/)
{
	// TODO: add extra initialization before printing
}

void CCefView::OnEndPrinting(CDC* /*pDC*/, CPrintInfo* /*pInfo*/)
{
	// TODO: add cleanup after printing
}

// afx_msg
void CCefView::OnClose()
{
	__super::OnClose();
}

// afx_msg 
void CCefView::OnSetFocus(CWnd* pOldWnd)
{
	if (m_browser == nullptr) return;
	m_browser->GetHost()->SetFocus(true);
}

// afx_msg
void CCefView::OnDestroy()
{
	__super::OnDestroy();
}

void CCefView::OnRButtonUp(UINT /* nFlags */, CPoint point)
{
	ClientToScreen(&point);
	OnContextMenu(this, point);
}

void CCefView::OnContextMenu(CWnd* /* pWnd */, CPoint point)
{
#ifndef SHARED_HANDLERS
	theApp.GetContextMenuManager()->ShowPopupMenu(IDR_POPUP_EDIT, point.x, point.y, this, TRUE);
#endif
}


// CCefView diagnostics

#ifdef _DEBUG
void CCefView::AssertValid() const
{
	__super::AssertValid();
}

void CCefView::Dump(CDumpContext& dc) const
{
	__super::Dump(dc);
}

CWorkarea* CCefView::GetDocument() const // non-debug version is inline
{
	ASSERT(m_pDocument->IsKindOf(RUNTIME_CLASS(CWorkarea)));
	return (CWorkarea*) m_pDocument;
}
#endif //_DEBUG


// CCefView message handlers

// afx_msg 
void CCefView::OnSize(UINT nType, int cx, int cy)
{
	__super::OnSize(nType, cx, cy);
	if (m_clientHandler == nullptr) return;
	if (m_browser == nullptr) return;
	HWND hwnd = m_browser->GetHost()->GetWindowHandle();
	CRect rect;
	GetClientRect(&rect);
	::SetWindowPos(hwnd, HWND_TOP, rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top, SWP_NOZORDER);
	m_browser->GetHost()->WasResized();
}

// m_browser->GetHost()->Find(findId++, "text", forward, case, next)

// virtual
void CCefView::OnInitialUpdate()
{
	__super::OnInitialUpdate();

	/*
	CEF_VIEW_INFO viewInfo;
	//viewInfo.szUrl = L"app://domain";
	viewInfo.szUrl = L"http://domain";
	//viewInfo.szUrl = L"https://www.google.com.ua";
	SendMessage(WMI_CEF_VIEW_COMMAND, WMI_CEF_VIEW_COMMAND_OPEN, reinterpret_cast<LPARAM>(&viewInfo));
	*/

	/*
	CRect rect;
	GetClientRect(&rect);

	CefWindowInfo info;
	info.SetAsChild(GetSafeHwnd(), rect);

	CefBrowserSettings browserSettings;
	browserSettings.web_security = STATE_DISABLED;
	browserSettings.local_storage = STATE_ENABLED;
	cef_string_set(L"UTF-8", 5, &browserSettings.default_encoding, true);
	m_clientHandler = new CCefClientHandler(this);
	LPCSTR szRootUrl = "http://app"; 
	//LPCSTR szRootUrl = "https://www.google.com.ua";
	m_clientHandler->CreateBrowser(info, browserSettings, CefString(szRootUrl));
	*/
}

LRESULT CCefView::OnCefTabCommand(WPARAM wParam, LPARAM lParam)
{
	if (wParam == WMI_CEF_TAB_COMMAND_CLOSING) {
		if (m_browser != nullptr)
			m_browser->GetHost()->CloseBrowser(false);
	}
	return 0L;
}

// afx_msg 
LRESULT CCefView::OnOpenCefView(WPARAM wParam, LPARAM lParam)
{
	if (wParam != WMI_CEF_VIEW_COMMAND_OPEN) 
		return 0L;

	CEF_VIEW_INFO* pInfo = reinterpret_cast<CEF_VIEW_INFO*>(lParam);
	
	CRect rect;
	GetClientRect(&rect);

	CefWindowInfo info;
	info.SetAsChild(GetSafeHwnd(), rect);

	CefBrowserSettings browserSettings;
	browserSettings.web_security = STATE_DISABLED;
	browserSettings.local_storage = STATE_ENABLED;
	cef_string_set(L"UTF-8", 5, &browserSettings.default_encoding, true);

	m_clientHandler = new CCefClientHandler(this);
	m_clientHandler->CreateBrowser(info, browserSettings, CefString(pInfo->szUrl));
	return 0L;
}

HWND CCefView::OnBrowserCreated(CefRefPtr<CefBrowser> browser)
{
	m_browser = browser;
	return ::GetParent(GetSafeHwnd());
}

void CCefView::OnBrowserClosed(CefRefPtr<CefBrowser> browser)
{
	HWND hFrame = ::GetParent(GetSafeHwnd());
	if (hFrame != nullptr)
		::SendMessage(hFrame, WMI_CEF_TAB_COMMAND, WMI_CEF_TAB_COMMAND_CLOSED, reinterpret_cast<LPARAM>(GetSafeHwnd()));
	::SendMessage(GetSafeHwnd(), WM_CLOSE, 0, 0L);
}

// virtual 
void CCefView::OnBrowserClosing(CefRefPtr<CefBrowser> browser)
{
	HWND hWnd = GetSafeHwnd();
	::PostMessage(hWnd, WMI_CEF_TAB_COMMAND, WMI_CEF_TAB_COMMAND_CLOSING, reinterpret_cast<LPARAM>(hWnd));
}

void CCefView::DoCloseBrowser() 
{
}

// virtual 
void CCefView::OnBeforePopup(CefRefPtr<CefBrowser> browser, const wchar_t* url)
{
	CEF_VIEW_INFO viewInfo;
	viewInfo.szUrl = url;
	HWND hFrame = ::GetParent(GetSafeHwnd());
	::SendMessage(hFrame, WMI_CEF_VIEW_COMMAND, WMI_CEF_VIEW_COMMAND_CREATETAB, reinterpret_cast<LPARAM>(&viewInfo));
}

// virtual 
void CCefView::OnTitleChange(CefRefPtr<CefBrowser> browser, const wchar_t* title)
{
	CEF_VIEW_INFO viewInfo;
	viewInfo.szTitle = title;
	HWND hWndFrame = ::GetParent(GetSafeHwnd());
	::SendMessage(hWndFrame, WMI_CEF_VIEW_COMMAND, WMI_CEF_VIEW_COMMAND_SETTILE, reinterpret_cast<LPARAM>(&viewInfo));
}

// afx_msg
void CCefView::OnReload() 
{
	if (m_browser != nullptr)
		m_browser->Reload();
}

// afx_msg
void CCefView::OnReloadIgnoreCache() 
{
	if (m_browser != nullptr)
		m_browser->ReloadIgnoreCache();
}

// afx_msg
void CCefView::OnShowDevTools() 
{
	if (m_browser == nullptr)
		return;
	auto host = m_browser->GetHost();
	CefWindowInfo info;
	info.ex_style = WS_EX_PALETTEWINDOW;
	info.SetAsPopup(host->GetWindowHandle(), "Developer tools");
	CefBrowserSettings settings;
	CefPoint elementAt;
	host->ShowDevTools(info, nullptr, settings, elementAt);
}

// afx_msg
void CCefView::OnNavigateBack() 
{
	if (m_browser != nullptr)
		m_browser->GoBack();
}

// afx_msg 
void CCefView::OnNavigateForward()
{
	if (m_browser != nullptr)
		m_browser->GoForward();
}

// afx_msg
LRESULT CCefView::OnAppCommand(WPARAM wParam, LPARAM lParam) 
{
	switch (GET_APPCOMMAND_LPARAM(lParam)) {
	case APPCOMMAND_BROWSER_BACKWARD:
		OnNavigateBack();
		break;
	case APPCOMMAND_BROWSER_FORWARD:
		OnNavigateForward();
		break;
	}
	return 0;
}

// afx_msg
LRESULT CCefView::OnIdleUpdateButtons(WPARAM wParam, LPARAM lParam) 
{
	if (wParam == WMI_CEF_IDLE_UPDATE_WPARAM_NAVIGATE) {
		if (m_browser == nullptr)
			return 0L;
		int canGoBack = m_browser->CanGoBack() ? 1 : 0;
		int canGoForward = m_browser->CanGoForward() ? 1 : 0;
		return MAKELPARAM(canGoBack, canGoForward);
	}
	return 0L;
}