#pragma once


class CCefApplication : 
	public CefApp,
	public CefBrowserProcessHandler,
	public CefRenderProcessHandler
{
	static bool m_bInit;
public:
	CCefApplication() {};
	virtual ~CCefApplication();
	virtual void OnRegisterCustomSchemes(CefRawPtr<CefSchemeRegistrar> registrar) override;
	virtual void OnBeforeCommandLineProcessing(const CefString& process_type, CefRefPtr<CefCommandLine> command_line) override;

	virtual CefRefPtr<CefBrowserProcessHandler> GetBrowserProcessHandler() override { return this; }
	virtual CefRefPtr<CefRenderProcessHandler> GetRenderProcessHandler() override { return this; }

	static void Init(HINSTANCE hInstance);
	static void Destroy();
	static bool IsInit() { return m_bInit; }

	// CefBrowserProcessHandler
	virtual void OnBeforeChildProcessLaunch(CefRefPtr<CefCommandLine> command_line) override;
	// CefRenderProcessHandler
	virtual void OnContextCreated(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefV8Context> context) override;

private:
	IMPLEMENT_REFCOUNTING(CCefApplication);
	DISALLOW_COPY_AND_ASSIGN(CCefApplication);
};

