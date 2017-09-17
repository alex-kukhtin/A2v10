
// mainview.cpp : implementation of the CCefView class
//

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
	ON_WM_SIZE()
	// Standard printing commands
	ON_COMMAND(ID_FILE_PRINT, OnFilePrint)
	ON_COMMAND(ID_FILE_PRINT_DIRECT, OnFilePrint)
	ON_COMMAND(ID_FILE_PRINT_PREVIEW, OnFilePrintPreview)
	ON_WM_CONTEXTMENU()
	ON_WM_RBUTTONUP()
	ON_COMMAND(ID_NAVIGATE_REFRESH, OnReload)
	ON_COMMAND(ID_NAVIGATE_REFRESH_IGNORE_CACHE, OnReloadIgnoreCache)
	ON_COMMAND(ID_SHOW_DEVTOOLS, OnShowDevTools)
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
	if (m_clientHandler != nullptr)
	{
		if (m_browser != nullptr)
		{
			HWND hwnd = m_browser->GetHost()->GetWindowHandle();
			CRect rect;
			GetClientRect(&rect);
			::SetWindowPos(hwnd, HWND_TOP, rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top, SWP_NOZORDER);
			m_browser->GetHost()->WasResized();
		}
	}
}

// m_browser->GetHost()->Find(findId++, "text", forward, case, next)

// virtual
void CCefView::OnInitialUpdate()
{
	__super::OnInitialUpdate();

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
}


void CCefView::OnBrowserCreated(CefRefPtr<CefBrowser> browser)
{
	m_browser = browser;
}

void CCefView::OnBrowserClosed(CefRefPtr<CefBrowser> browser)
{
	if ((m_browser != nullptr) && (m_browser->GetIdentifier() == browser->GetIdentifier()))
	{
		m_browser = nullptr;
		m_clientHandler->DetachDelegate();
	}
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
