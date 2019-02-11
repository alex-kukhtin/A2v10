#pragma once


class CCefApplication : public CefApp
{
	static bool m_bInit;
public:
	CCefApplication() {};
	virtual void OnRegisterCustomSchemes(CefRawPtr<CefSchemeRegistrar> registrar) override;

	static void Init(HINSTANCE hInstance);
	static bool IsInit() { return m_bInit; }

private:
	IMPLEMENT_REFCOUNTING(CCefApplication);
	DISALLOW_COPY_AND_ASSIGN(CCefApplication);
};

