// Copyright © 2017-2020 Alex Kukhtin. All rights reserved.


#include "stdafx.h"

#include "cefapp.h"
#include "callbackmap.h"
#include "upload.h"
#include "posterm.h"
#include "terminal.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

//static 
bool CCefApplication::m_bInit = false;
std::wstring CCefApplication::_terminalCode;

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
	//command_line->AppendSwitchWithValue(L"single-process", "1"); //??? debugger tools???

	//command_line->AppendSwitchWithValue(L"disable-gpu", L"1");
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
	settings.remote_debugging_port = 5599; /// TODO
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

	CefRefPtr<CefV8Handler> posterm = new CNativePosTermHandler();
	CefRefPtr<CefV8Value> postermFunc = CefV8Value::CreateFunction(L"posterm", posterm);

	CefRefPtr<CefV8Handler> terminal = new CNativeTerminalHandler();
	CefRefPtr<CefV8Value> terminalFunc = CefV8Value::CreateFunction(L"terminal", terminal);

	host->SetValue(L"version", str, V8_PROPERTY_ATTRIBUTE_READONLY);
	host->SetValue(L"upload", uploadFunc, V8_PROPERTY_ATTRIBUTE_READONLY);
	host->SetValue(L"posterm", postermFunc, V8_PROPERTY_ATTRIBUTE_READONLY);
	host->SetValue(L"terminal", terminalFunc, V8_PROPERTY_ATTRIBUTE_READONLY);
	global->SetValue(L"cefHost", host, V8_PROPERTY_ATTRIBUTE_READONLY);
}

// virtual 
void CCefApplication::OnContextReleased(CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame,
	CefRefPtr<CefV8Context> context) 
{
}

// virtual 
bool CCefApplication::OnProcessMessageReceived(CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame,
	CefProcessId source_process,
	CefRefPtr<CefProcessMessage> message) 
{
	CEF_REQUIRE_RENDERER_THREAD();

	// RESULT from UI thread
	CallbackMap* pMap = CallbackMap::Current();
	const wchar_t* msgname = message->GetName().c_str();
	if (wcsncmp(msgname, L"pos_result", 32) == 0) {
		CefRefPtr<CefListValue> args = message->GetArgumentList();
		auto argList = message->GetArgumentList();
		int wParam = argList->GetInt(0);
		pMap->Process(wParam, argList->GetString(1).c_str());
		return true;
	}
	else if (wcsncmp(msgname, L"pos_termid", 32) == 0) {
		CefRefPtr<CefListValue> args = message->GetArgumentList();
		auto argList = message->GetArgumentList();
		CefString termCode = argList->GetString(0);
		CCefApplication::_terminalCode = termCode.c_str();
		return true;
	}
	return false;
}

