#pragma once


class CCefClientHandler :
	public CefClient,
	public CefDisplayHandler,
	public CefLifeSpanHandler,
	public CefLoadHandler,
	public CefRequestHandler
{
public:
	class Delegate {
	public:
		virtual void OnBrowserCreated(CefRefPtr<CefBrowser> browser) = 0;
		virtual void OnBrowserClosed(CefRefPtr<CefBrowser> browser) = 0;
	protected:
		virtual ~Delegate();
	};

	CCefClientHandler(Delegate* pDelegate);
	virtual ~CCefClientHandler();


	// CefClient
	virtual CefRefPtr<CefDisplayHandler> GetDisplayHandler() override { return this; }
	virtual CefRefPtr<CefLifeSpanHandler> GetLifeSpanHandler() override { return this; }
	virtual CefRefPtr<CefLoadHandler> GetLoadHandler() override { return this; }
	virtual CefRefPtr<CefRequestHandler> GetRequestHandler() override { return this; }

	virtual void OnAfterCreated(CefRefPtr<CefBrowser> browser) override;
	virtual bool DoClose(CefRefPtr<CefBrowser> browser) override;

	void DetachDelegate();

	void CreateBrowser(CefWindowInfo const & info, CefBrowserSettings const & settings, CefString const & url);

	// CefRequestHandler
	virtual ReturnValue OnBeforeResourceLoad(
		CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		CefRefPtr<CefRequest> request,
		CefRefPtr<CefRequestCallback> callback) override;

	virtual CefRefPtr<CefResourceHandler> GetResourceHandler(
		CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		CefRefPtr<CefRequest> request) override;

private:
	static void SetupResourceManager(CefRefPtr<CefResourceManager> resource_manager);

	Delegate* m_pDelegate;
	CefRefPtr<CefResourceManager> m_manager;
	// Include the default reference counting implementation.
	IMPLEMENT_REFCOUNTING(CCefClientHandler);
	// Include the default locking implementation.
	IMPLEMENT_LOCKING(CCefClientHandler);
};

