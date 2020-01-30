// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"

#include "cefclient.h"
#include "cefscheme.h"
#include "cefapp.h"
#include "A2v10.Application.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// virtual 
CCefClientHandler::Delegate::~Delegate()
{

}

CCefClientHandler::CCefClientHandler(CCefClientHandler::Delegate* pDelegate)
	: m_pDelegate(pDelegate), m_resourceHandler(nullptr), m_bClosing(false), m_hWndFrame(nullptr)
{
	m_manager = new CefResourceManager();
	SetupResourceManager(m_manager);
	CClientSchemeHandler::RegisterSchemaHandlerFactory();
}


// static
void CCefClientHandler::SetupResourceManager(CefRefPtr<CefResourceManager> resource_manager)
{
	if (!CefCurrentlyOn(TID_IO)) {
		// Execute on the browser IO thread.
		CefPostTask(TID_IO, base::Bind(SetupResourceManager, resource_manager));
		return;
	}
}

// virtual
CCefClientHandler::~CCefClientHandler()
{
	if (m_hWndFrame)
		::PostMessage(m_hWndFrame, WMI_CEF_TAB_COMMAND, WMI_CEF_TAB_COMMAND_ISALLCLOSED, 0L);
}

void CCefClientHandler::DetachDelegate()
{
	m_pDelegate = nullptr;
}

void CCefClientHandler::CreateBrowser(CefWindowInfo const & info, CefBrowserSettings const & settings, CefString const & url)
{
	CefBrowserHost::CreateBrowser(info, this, url, settings, nullptr, nullptr);
}

// virtual 
bool CCefClientHandler::OnOpenURLFromTab(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, const CefString& target_url, CefRequestHandler::WindowOpenDisposition target_disposition, bool user_gesture)
{
	return false;
}

// virtual
void CCefClientHandler::OnAfterCreated(CefRefPtr<CefBrowser> browser)
{
	CEF_REQUIRE_UI_THREAD();
	if (m_pDelegate != nullptr)
		m_hWndFrame = m_pDelegate->OnBrowserCreated(browser);
}

// virtual 
void CCefClientHandler::OnBeforeClose(CefRefPtr<CefBrowser> browser)
{
	CEF_REQUIRE_UI_THREAD();
	if (m_pDelegate != nullptr)
		m_pDelegate->OnBrowserClosed(browser);
}

// virtual 
bool CCefClientHandler::DoClose(CefRefPtr<CefBrowser> browser)
{
	CEF_REQUIRE_UI_THREAD();
	if (!m_bClosing) 
	{
		m_bClosing = true;
		if (m_pDelegate != nullptr)
			m_pDelegate->OnBrowserClosing(browser);
		return true; // disable
	}
	if (m_pDelegate != nullptr)
		m_pDelegate->OnBrowserClosed(browser);
	return false; // enable
}


//virtual 
CefResourceRequestHandler::ReturnValue CCefClientHandler::OnBeforeResourceLoad(
	CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame,
	CefRefPtr<CefRequest> request,
	CefRefPtr<CefRequestCallback> callback)
{
	CEF_REQUIRE_IO_THREAD();
	if (m_manager != nullptr)
		return m_manager->OnBeforeResourceLoad(browser, frame, request, callback);
	return RV_CONTINUE;
};

//virtual 
CefRefPtr<CefResourceHandler> CCefClientHandler::GetResourceHandler(
	CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame,
	CefRefPtr<CefRequest> request)
{
	CEF_REQUIRE_IO_THREAD();
	/*
	if (m_resourceHandler == nullptr)
		m_resourceHandler = new CClientSchemeHandler();
	return m_resourceHandler;
	*/
	if (m_manager != nullptr)
		return m_manager->GetResourceHandler(browser, frame, request);
	return nullptr;

}


// CefDisplayHandler
// virtual 
void CCefClientHandler::OnTitleChange(CefRefPtr<CefBrowser> browser, const CefString& title)
{
	CEF_REQUIRE_UI_THREAD();
	CefString title2 = title;
	if (m_pDelegate != nullptr) {
		if (title2 == "domain")
			title2 = " "; // simple domain - single space string
		m_pDelegate->OnTitleChange(browser, title2.c_str());
	}
}

// CefLifeSpanHandler
// virtual 
bool CCefClientHandler::OnBeforePopup(CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame, const CefString& target_url, const CefString& target_frame_name,
	CefLifeSpanHandler::WindowOpenDisposition target_disposition,
	bool user_gesture, const CefPopupFeatures& popupFeatures, CefWindowInfo& windowInfo,
	CefRefPtr<CefClient>& client, CefBrowserSettings& settings, CefRefPtr<CefDictionaryValue>& extra_info,
	bool* no_javascript_access)
{
	CEF_REQUIRE_UI_THREAD();
	if (m_pDelegate != nullptr) {
		m_pDelegate->OnBeforePopup(browser, target_url.c_str());
		return true;
	}
	return false;
}

// CefKeyboardHandler
// virtual 
bool CCefClientHandler::OnPreKeyEvent(CefRefPtr<CefBrowser> browser, const CefKeyEvent& event,
	CefEventHandle os_event, bool* is_keyboard_shortcut)
{
	if (!os_event)
		return false;
	if (os_event->message == WM_KEYDOWN) {
		if (HandleKey(os_event->wParam))
			return true;
	}
	else if (os_event->message == WM_SYSKEYDOWN) {
		if (HandleSysKey(os_event->wParam))
			return true;
	}
	return false;
}

bool CCefClientHandler::HandleKey(WPARAM wKey)
{
	if (!m_hWndFrame)
		return false;
	switch (wKey) {
	case VK_F1:
		if (GetAsyncKeyState(VK_CONTROL) < 0 )
			::PostMessage(m_hWndFrame, WM_COMMAND, ID_APP_ABOUT, 0L);
		break;
	case VK_F5:
		::PostMessage(m_hWndFrame, WM_COMMAND, ID_NAVIGATE_REFRESH, 0L);
		break;
	case VK_F12: 
		::PostMessage(m_hWndFrame, WM_COMMAND, ID_SHOW_DEVTOOLS, 0L);
		break;
	default:
		return false;
	}
	return true;
}

bool CCefClientHandler::HandleSysKey(WPARAM wKey)
{
	if (!m_hWndFrame)
		return false;
	switch (wKey) {
	case VK_LEFT:
		::PostMessage(m_hWndFrame, WM_COMMAND, ID_NAVIGATE_BACK, 0L);
		break;
	case VK_RIGHT:
		::PostMessage(m_hWndFrame, WM_COMMAND, ID_NAVIGATE_FORWARD, 0L);
		break;
	default:
		return false;
	}
	return true;
}

// CefDownloadHandler
// virtual 
void CCefClientHandler::OnBeforeDownload(CefRefPtr<CefBrowser> browser, CefRefPtr<CefDownloadItem> download_item,
	const CefString& suggested_name, CefRefPtr<CefBeforeDownloadCallback> callback)
{
	if (callback != nullptr) {
		callback->Continue(L"", true);
	}
}


// IPC
// virtual 
bool CCefClientHandler::OnProcessMessageReceived(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, 
	CefProcessId source_process, CefRefPtr<CefProcessMessage> message) 
{
	static std::wstring __arg;
	// from POS_TERM
	CEF_REQUIRE_UI_THREAD();
	if (wcsncmp(message->GetName().c_str(), L"pos_src", 32) == 0) {
		auto argList = message->GetArgumentList();
		int key = argList->GetInt(0);
		__arg = argList->GetString(1);
		theApp.PostPosThreadMessage(key, __arg.c_str());
		return true;
	}
	return false;
}
