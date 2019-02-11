// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.


#include "stdafx.h"

#include "cefapp.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

bool CCefApplication::m_bInit = false;

// virtual 
void CCefApplication::OnRegisterCustomSchemes(CefRawPtr<CefSchemeRegistrar> registrar)
{
	//return;
	registrar->AddCustomScheme("http", 
		true,  /*is_standard*/
		true,  /*is_local*/
		true, /*is_display_isolated*/
		false, /*is_secure*/
		true,  /*is_cors_enabled*/
		true   /*is_csp_bypassing*/);
}

// static 
void CCefApplication::Init(HINSTANCE hInstance)
{
	CefEnableHighDPISupport();

	CefMainArgs args(hInstance);
	CefSettings settings;
	//settings.single_process = true; // TODO: // check ????
	settings.multi_threaded_message_loop = true;
	settings.no_sandbox = true;
	settings.remote_debugging_port = 5555; /// TODO

	static CefRefPtr<CCefApplication> app(new CCefApplication());

	m_bInit =  CefInitialize(args, settings, app.get(), nullptr);
}
