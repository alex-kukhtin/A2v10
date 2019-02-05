// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"

#include "cefclient.h"
#include "cefscheme.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// virtual 
CCefClientHandler::Delegate::~Delegate()
{

}

CCefClientHandler::CCefClientHandler(CCefClientHandler::Delegate* pDelegate)
	: m_pDelegate(pDelegate)
{
	m_manager = new CefResourceManager();
	SetupResourceManager(m_manager);
}


// static
void CCefClientHandler::SetupResourceManager(CefRefPtr<CefResourceManager> resource_manager)
{
	if (!CefCurrentlyOn(TID_IO)) {
		// Execute on the browser IO thread.
		CefPostTask(TID_IO, base::Bind(SetupResourceManager, resource_manager));
		return;
	}

	/*
	const std::string& test_origin = shared::kTestOrigin;

	resource_manager->AddProvider(
	shared::CreateBinaryResourceProvider(test_origin), 100, std::string());
	*/
}

// virtual
CCefClientHandler::~CCefClientHandler()
{

}

void CCefClientHandler::DetachDelegate()
{
	m_pDelegate = nullptr;
}

void CCefClientHandler::CreateBrowser(CefWindowInfo const & info, CefBrowserSettings const & settings, CefString const & url)
{
	CClientSchemeHandler::RegisterSchemaHandlerFactory();
	CefBrowserHost::CreateBrowser(info, this, url, settings, nullptr);
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
		m_pDelegate->OnBrowserCreated(browser);
}

// virtual 
bool CCefClientHandler::DoClose(CefRefPtr<CefBrowser> browser)
{
	CEF_REQUIRE_UI_THREAD();
	if (m_pDelegate != nullptr)
		m_pDelegate->OnBrowserClosed(browser);
	return false;
}


//virtual 
CefRequestHandler::ReturnValue CCefClientHandler::OnBeforeResourceLoad(
	CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame,
	CefRefPtr<CefRequest> request,
	CefRefPtr<CefRequestCallback> callback)
{
	CEF_REQUIRE_IO_THREAD();
	return m_manager->OnBeforeResourceLoad(browser, frame, request, callback);
	//return RV_CONTINUE;
};

//virtual 
CefRefPtr<CefResourceHandler> CCefClientHandler::GetResourceHandler(
	CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame,
	CefRefPtr<CefRequest> request)
{
	return m_manager->GetResourceHandler(browser, frame, request);
}


// CefDisplayHandler
// virtual 
void CCefClientHandler::OnTitleChange(CefRefPtr<CefBrowser> browser, const CefString& title)
{
	int z = 55;
}

// CefLifeSpanHandler
// virtual 
bool CCefClientHandler::OnBeforePopup(CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame, const CefString& target_url, const CefString& target_frame_name,
	CefLifeSpanHandler::WindowOpenDisposition target_disposition,
	bool user_gesture, const CefPopupFeatures& popupFeatures, CefWindowInfo& windowInfo,
	CefRefPtr<CefClient>& client, CefBrowserSettings& settings, bool* no_javascript_access)
{
	return false;
}
