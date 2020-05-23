// A2v10.Application.cpp : Defines the class behaviors for the application.

#include "stdafx.h"
#include "afxwinappex.h"
#include "afxdialogex.h"
#include "A2v10.Application.h"
#include "navtabs.h"
#include "consolewnd.h"
#include "mainframe.h"

#include "workarea.h"
#include "cefclient.h"
#include "cefview.h"
#include "cefapp.h"
#include "defaultview.h"
#include "posthread.h"
#include "appconfig.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#pragma comment(lib,"../../bin/A2v10.Base.lib")
#pragma comment(lib,"../../bin/A2v10.Net.Shim.lib")

#pragma comment(lib,"../../bin/libcef.lib")
#pragma comment(lib,"../Lib/A2v10.StaticBase.lib")
#pragma comment(lib,"../Lib/A2v10.PosTerm.lib")

// CMainApp

BEGIN_MESSAGE_MAP(CMainApp, CA2WinApp)
	ON_COMMAND(ID_FILE_NEW, OnFileNew)
END_MESSAGE_MAP()


// CMainApp construction

CMainApp::CMainApp()
	:m_dwPosThreadId(0), m_hPosThreadHandle(0),
	m_pDocTemplate(nullptr), m_pAppConfig(nullptr),
	_terminalCode(L"")
{
	// support Restart Manager
	m_dwRestartManagerSupportFlags = AFX_RESTART_MANAGER_SUPPORT_ALL_ASPECTS;
#ifdef _MANAGED
	System::Windows::Forms::Application::SetUnhandledExceptionMode(System::Windows::Forms::UnhandledExceptionMode::ThrowException);
#endif

	// TODO: replace application ID string below with unique ID string; recommended
	// format for string is CompanyName.ProductName.SubProduct.VersionInformation
	SetAppID(_T("A2v10.Desktop.NoVersion"));
}

// The one and only CMainApp object
CMainApp theApp;


// CMainApp initialization

BOOL CMainApp::InitInstance()
{

	if (!__super::InitInstance())
		return FALSE;

	CCefApplication::Init(m_hInstance);

	if (wcsstr(m_lpCmdLine, L"--") != nullptr)
		return TRUE;

	EnableTaskbarInteraction(FALSE);

	CMultiDocTemplate* pDocTemplate;
	pDocTemplate = new CMultiDocTemplate(
		IDR_MAINFRAME,
		RUNTIME_CLASS(CWorkarea),
		RUNTIME_CLASS(CMainFrame),       // main SDI frame window
		RUNTIME_CLASS(CDefaultView));
	if (!pDocTemplate)
		return FALSE;
	m_pDocTemplate = pDocTemplate;
	AddDocTemplate(pDocTemplate);


	// Parse command line for standard shell commands, DDE, file open
	CA2CommandLineInfo cmdInfo;
	ParseCommandLine(cmdInfo);

	m_strUdlFileName = cmdInfo.m_strFileName;
	m_strInitialUrl = cmdInfo.Url();

	m_pAppConfig = LoadConfigFile(cmdInfo.Config());
	if (m_pAppConfig) {
		if (!m_pAppConfig->m_startUrl.empty())
			m_strInitialUrl = m_pAppConfig->m_startUrl.c_str();
		if (!m_pAppConfig->m_connectionString.empty())
			m_strConnectionString = m_pAppConfig->m_connectionString.c_str();
	}

	// Dispatch commands specified on the command line.  Will return FALSE if
	// app was launched with /RegServer, /Register, /Unregserver or /Unregister.
	if (!ProcessShellCommand(cmdInfo))
		return FALSE;

	// The one and only window has been initialized, so show and update it
	m_pMainWnd->ShowWindow(SW_SHOW);
	m_pMainWnd->UpdateWindow();
	CMenu* pSysMenu = m_pMainWnd->GetSystemMenu(FALSE);
	
	if (pSysMenu != nullptr)
	{
		CString strAbout;
		CString strOptions;
		CString strDevTools;
		strAbout.LoadString(IDS_ID_APP_ABOUT);
		strOptions.LoadString(IDS_ID_TOOLS_OPTIONS);
		strDevTools.LoadString(IDS_ID_SHOW_DEVTOOLS);

		pSysMenu->AppendMenu(MF_SEPARATOR);
		pSysMenu->AppendMenu(MF_STRING, IDM_SYS_OPTIONS,  strOptions);
		pSysMenu->AppendMenu(MF_STRING, IDM_SYS_DEVTOOLS, strDevTools);
		pSysMenu->AppendMenu(MF_STRING, IDM_SYS_ABOUTBOX, strAbout);
	}

	m_pMainWnd->PostMessage(WM_COMMAND, ID_APP_START);

	if (!StartPosThread())
		return FALSE;
	return TRUE;
}

CAppConfig* CMainApp::LoadConfigFile(LPCWSTR szConfig)
{
	if (!szConfig || !*szConfig)
		return nullptr;
	CString configText;
	CFileTools::LoadFile(szConfig, configText);
	if (configText.IsEmpty())
		return nullptr; // file not found
	CAppConfig* pAppConfig = new CAppConfig();
	try
	{
		JsonParser prs;
		prs.SetTarget(pAppConfig);
		prs.Parse(configText);
		return pAppConfig;
	}
	catch (CFileException* ex)
	{
		ex->ReportError();
		ex->Delete();
	}
	catch (JsonException& je)
	{
		AfxMessageBox(je.GetMessage());
	}
	catch (...) {
		AfxMessageBox(L"JSON. Unknown error");
	}
	if (pAppConfig)
		delete pAppConfig;
	return nullptr;
}

bool CMainApp::StartPosThread()
{
	if (!m_pAppConfig || !m_pAppConfig->NeedBackgroundThread())
		return true;
	_traceTarget.m_hWnd = m_pMainWnd->GetSafeHwnd();
	PosSetTraceTarget(&_traceTarget);
	if (!m_pAppConfig->ConnectToPrinter())
		return false;
	if (!m_pAppConfig->ConnectToAcquiringTerminal())
		return false;

	CWinThread* pThread = AfxBeginThread(RUNTIME_CLASS(CPosThreadWnd), THREAD_PRIORITY_NORMAL, 0, CREATE_SUSPENDED, nullptr);
	pThread->m_bAutoDelete = TRUE;
	pThread->ResumeThread();

	m_dwPosThreadId = pThread->m_nThreadID;
	m_hPosThreadHandle = pThread->m_hThread;

	return true;
}

void CMainApp::PostPosThreadMessage(int key, LPCWSTR szMessage)
{
	if (!m_dwPosThreadId) return;
	::PostThreadMessage(m_dwPosThreadId, WMI_POS_COMMAND_SEND, key, (LPARAM) szMessage);
}


// virtual 
BOOL CMainApp::PumpMessage()
{
	BOOL rc = __super::PumpMessage();
	//CefDoMessageLoopWork();
	return rc;
}

int CMainApp::ExitInstance()
{
	_traceTarget.m_hWnd = nullptr;

	if (m_hPosThreadHandle) {
		::TerminateThread(m_hPosThreadHandle, 0);
		::WaitForSingleObject(m_hPosThreadHandle, 100);
	}

	if (m_pAppConfig)
		m_pAppConfig->ShutDown();

	AfxOleTerm(FALSE);

	if (CCefApplication::IsInit()) {
		CCefApplication::Destroy();
	}

	if (m_pAppConfig) {
		delete m_pAppConfig;
		m_pAppConfig = nullptr;
	}
	return __super::ExitInstance();
}


// CMainApp message handlers

void CMainApp::OnFileNew() 
{
	CDocument* pDoc = nullptr;
	CFrameWnd* pFrame = DYNAMIC_DOWNCAST(CFrameWnd, CWnd::GetActiveWindow());
	
	if (pFrame != nullptr)
		pDoc = pFrame->GetActiveDocument();

	if (pFrame == nullptr || pDoc == nullptr)
	{
		// if it's the first document, create as normal
		CWinApp::OnFileNew();
	}
	else
	{
		// Otherwise, see if we have to save modified, then
		// ask the document to reinitialize itself.
		if (!pDoc->SaveModified())
			return;

		CDocTemplate* pTemplate = pDoc->GetDocTemplate();
		ATLASSERT(pTemplate != nullptr);

		if (pTemplate != nullptr)
			pTemplate->SetDefaultTitle(pDoc);
		pDoc->OnNewDocument();
	}
}

//virtual 
void CAppTraceTarget::Trace(TraceType type, const wchar_t* message)
{
	if (!m_hWnd) return;
	WPARAM wParam = WMI_POS_TRACE_WPARAM_INFO;
	switch (type) {
	case ITraceTarget::TraceType::_error:
		wParam = WMI_POS_TRACE_WPARAM_ERROR;
		break;
	}
	::SendMessage(m_hWnd, WMI_POS_TRACE, wParam, (LPARAM)message);
}
