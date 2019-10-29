// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.


#include "stdafx.h"

#include "cefapp.h"
#include "upload.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

bool CCefApplication::m_bInit = false;

// virtual
CCefApplication::~CCefApplication()
{

}

// virtual 
void CCefApplication::OnRegisterCustomSchemes(CefRawPtr<CefSchemeRegistrar> registrar)
{
	int opts = 
		cef_scheme_options_t::CEF_SCHEME_OPTION_STANDARD | 
		cef_scheme_options_t::CEF_SCHEME_OPTION_LOCAL |
		cef_scheme_options_t::CEF_SCHEME_OPTION_CORS_ENABLED;
	
	registrar->AddCustomScheme("http", opts);
	/*
		true,  /* is_standard * /
		false, /* is_local* /
		false, /* is_display_isolated * /
		false, /* is_secure* /
		true,  /* is_cors_enabled* /
		false  /* is_csp_bypassing* /;
	*/
}

// virtual 
void CCefApplication::OnBeforeCommandLineProcessing(const CefString& process_type, CefRefPtr<CefCommandLine> command_line) 
{
	if (command_line == nullptr)
		return;
	command_line->AppendSwitchWithValue(L"process-per-site", L"1");
	//command_line->AppendSwitchWithValue(L"single-process", "1"); //?? debugger tools???

	command_line->AppendSwitchWithValue(L"disable-gpu", L"1");
	command_line->AppendSwitchWithValue(L"disable-software-rasterizer", L"1");
	command_line->AppendSwitchWithValue(L"enable-print-preview", L"1");
}

void CCefApplication::Destroy()
{

	CefClearSchemeHandlerFactories();
	//CefShutdown(); // CEF BUG for single process mode
}

// static 
void CCefApplication::Init(HINSTANCE hInstance)
{
	CefEnableHighDPISupport();

	CefMainArgs args(hInstance);
	CefSettings settings;
	
	settings.multi_threaded_message_loop = true;
	settings.no_sandbox = true;
	settings.windowless_rendering_enabled = false;
	settings.remote_debugging_port = 5555; /// TODO
	settings.background_color = 0xfff2f3f9; // BG_BRUSH_NORMAL (TABS)

	m_bInit =  CefInitialize(args, settings, new CCefApplication(), nullptr);
}

// virtual 
void CCefApplication::OnBeforeChildProcessLaunch(CefRefPtr<CefCommandLine> command_line)
{
}


// CefRenderProcessHandler
// virtual 
void CCefApplication::OnContextCreated(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefV8Context> context)
{
	auto moduleVersion = CModuleVersion::GetCurrentFullAppVersion();

	// Retrieve the context's window object.
	CefRefPtr<CefV8Value> global = context->GetGlobal();
	
	CefRefPtr<CefV8Value> host = CefV8Value::CreateObject(nullptr, nullptr);
	CefRefPtr<CefV8Value> str = CefV8Value::CreateString(moduleVersion.GetString());


	CefRefPtr<CefV8Handler> upload = new CNativeUploadHandler();
	CefRefPtr<CefV8Value> uploadFunc = CefV8Value::CreateFunction(L"upload", upload);
	host->SetValue(L"version", str, V8_PROPERTY_ATTRIBUTE_READONLY);
	host->SetValue(L"upload", uploadFunc, V8_PROPERTY_ATTRIBUTE_READONLY);
	global->SetValue(L"cefHost", host, V8_PROPERTY_ATTRIBUTE_READONLY);
	int z = 55;
}
