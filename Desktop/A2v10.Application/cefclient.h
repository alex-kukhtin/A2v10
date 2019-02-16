#pragma once


class CCefClientHandler :
	public CefClient,
	public CefDisplayHandler,
	public CefLifeSpanHandler,
	public CefLoadHandler,
	public CefRequestHandler,
	public CefKeyboardHandler,
	public CefDownloadHandler,
	public CefFocusHandler
{
	bool m_bClosing;
	HWND m_hWndFrame;

public:
	class Delegate {
	public:
		virtual HWND OnBrowserCreated(CefRefPtr<CefBrowser> browser) = 0;
		virtual void OnBrowserClosed(CefRefPtr<CefBrowser> browser) = 0;
		virtual void OnBrowserClosing(CefRefPtr<CefBrowser> browser) = 0;
		virtual void OnBeforePopup(CefRefPtr<CefBrowser> browser, const wchar_t* url) = 0;
		virtual void OnTitleChange(CefRefPtr<CefBrowser> browser, const wchar_t* title) = 0;
	protected:
		virtual ~Delegate();
	};

	CCefClientHandler(Delegate* pDelegate);
	virtual ~CCefClientHandler();

	CefRefPtr<CefResourceHandler> m_resourceHandler;
	// CefClient
	virtual CefRefPtr<CefDisplayHandler> GetDisplayHandler() override { return this; }
	virtual CefRefPtr<CefLifeSpanHandler> GetLifeSpanHandler() override { return this; }
	virtual CefRefPtr<CefLoadHandler> GetLoadHandler() override { return this; }
	virtual CefRefPtr<CefRequestHandler> GetRequestHandler() override { return this; }
	virtual CefRefPtr<CefKeyboardHandler> GetKeyboardHandler() override { return this; }
	virtual CefRefPtr<CefDownloadHandler> GetDownloadHandler() override { return this; }

	virtual bool DoClose(CefRefPtr<CefBrowser> browser) override;
	virtual bool OnOpenURLFromTab(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, const CefString& target_url, CefRequestHandler::WindowOpenDisposition target_disposition, bool user_gesture) override;

	void DetachDelegate();

	void CreateBrowser(CefWindowInfo const & info, CefBrowserSettings const & settings, CefString const & url);

	// CefDisplayHandler
	virtual void OnTitleChange(CefRefPtr<CefBrowser> browser, const CefString& title) override;

	// CefLifeSpanHandler
	virtual bool OnBeforePopup(CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame, const CefString& target_url, const CefString& target_frame_name,
		CefLifeSpanHandler::WindowOpenDisposition target_disposition,
		bool user_gesture, const CefPopupFeatures& popupFeatures, CefWindowInfo& windowInfo,
		CefRefPtr<CefClient>& client, CefBrowserSettings& settings, bool* no_javascript_access) override;
	virtual void OnAfterCreated(CefRefPtr<CefBrowser> browser) override;
	virtual void OnBeforeClose(CefRefPtr<CefBrowser> browser) override;

	// CefRequestHandler
	virtual ReturnValue OnBeforeResourceLoad(
		CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		CefRefPtr<CefRequest> request,
		CefRefPtr<CefRequestCallback> callback) override;

	virtual CefRefPtr<CefResourceHandler> GetResourceHandler(
		CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame,
		CefRefPtr<CefRequest> request) override;

	// CefKeyboardHandler
	virtual bool OnPreKeyEvent(CefRefPtr<CefBrowser> browser, const CefKeyEvent& event,
		CefEventHandle os_event, bool* is_keyboard_shortcut) override;

	// CefDownloadHandler
	virtual void OnBeforeDownload(CefRefPtr<CefBrowser> browser, CefRefPtr<CefDownloadItem> download_item,
		const CefString& suggested_name, CefRefPtr<CefBeforeDownloadCallback> callback) override;

	//CefFocusHandler

private:
	static void SetupResourceManager(CefRefPtr<CefResourceManager> resource_manager);
	bool HandleKey(WPARAM wKey);
	bool HandleSysKey(WPARAM wKey);

	Delegate* m_pDelegate;
	CefRefPtr<CefResourceManager> m_manager;
	// Include the default reference counting implementation.
	IMPLEMENT_REFCOUNTING(CCefClientHandler);
	// Include the default locking implementation.
	IMPLEMENT_LOCKING(CCefClientHandler);
	DISALLOW_COPY_AND_ASSIGN(CCefClientHandler);
};

