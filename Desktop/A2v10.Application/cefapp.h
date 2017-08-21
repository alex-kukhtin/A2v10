#pragma once


class CCefApplication : public CefApp
{
public:
	CCefApplication() {};
	virtual void OnRegisterCustomSchemes(CefRawPtr<CefSchemeRegistrar> registrar) override;

	static void CCefApplication::Init(HINSTANCE hInstance);

private:
	IMPLEMENT_REFCOUNTING(CCefApplication);
	DISALLOW_COPY_AND_ASSIGN(CCefApplication);
};

