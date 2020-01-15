// A2v10.Application.cpp : Defines the class behaviors for the application.

#include "stdafx.h"
#include "afxwinappex.h"
#include "afxdialogex.h"
#include "A2v10.Application.h"
#include "navtabs.h"
#include "mainframe.h"

#include "workarea.h"
#include "cefclient.h"
#include "cefview.h"
#include "cefapp.h"
#include "defaultview.h"
#include "posthread.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#pragma comment(lib,"../../bin/A2v10.Base.lib")
#pragma comment(lib,"../../bin/A2v10.Net.Shim.lib")

#pragma comment(lib,"../../bin/libcef.lib")

// CMainApp

BEGIN_MESSAGE_MAP(CMainApp, CA2WinApp)
	//ON_COMMAND(ID_FILE_NEW_FRAME, OnFileNewFrame)
	ON_COMMAND(ID_FILE_NEW, OnFileNew)
END_MESSAGE_MAP()


// CMainApp construction

CMainApp::CMainApp()
	:m_dwPosThreadId(0), m_hPosThreadHandle(0),
	m_pDocTemplate(nullptr)
{
	// support Restart Manager
	m_dwRestartManagerSupportFlags = AFX_RESTART_MANAGER_SUPPORT_ALL_ASPECTS;
#ifdef _MANAGED
	// If the application is built using Common Language Runtime support (/clr):
	//     1) This additional setting is needed for Restart Manager support to work properly.
	//     2) In your project, you must add a reference to System.Windows.Forms in order to build.
	System::Windows::Forms::Application::SetUnhandledExceptionMode(System::Windows::Forms::UnhandledExceptionMode::ThrowException);
#endif

	// TODO: replace application ID string below with unique ID string; recommended
	// format for string is CompanyName.ProductName.SubProduct.VersionInformation
	SetAppID(_T("A2v10.Desktop.NoVersion"));

	// TODO: add construction code here,
	// Place all significant initialization in InitInstance
}

// The one and only CMainApp object

CMainApp theApp;


// CMainApp initialization

BOOL CMainApp::InitInstance()
{

	if (!__super::InitInstance())
		return FALSE;


	EnableTaskbarInteraction(FALSE);

	CCefApplication::Init(m_hInstance);

	// Register the application's document templates.  Document templates
	//  serve as the connection between documents, frame windows and views
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

	CWinThread* pThread = AfxBeginThread(RUNTIME_CLASS(CPosThreadWnd), THREAD_PRIORITY_NORMAL, 0, CREATE_SUSPENDED, nullptr);
	pThread->m_bAutoDelete = TRUE;
	pThread->ResumeThread();

	m_dwPosThreadId = pThread->m_nThreadID;
	m_hPosThreadHandle = pThread->m_hThread;
	/*
	BOOL rc = ::PostThreadMessage(pThread->m_nThreadID, WMI_POS_COMMAND_SEND, 10, (LPARAM) L"TEST");
	if (!rc) {
		DWORD dw = ::GetLastError();
		int z = 55;
	}
	*/
	/*
	CPosThreadWnd* pWnd = new CPosThreadWnd();
	pWnd->Start(m_pMainWnd->GetSafeHwnd());
	BOOL created = pWnd->Create(nullptr, nullptr, WS_OVERLAPPED, CRect(0, 0, 0, 0), m_pMainWnd, 0, nullptr);
	if (!created) {
		DWORD dwError = ::GetLastError();
		AfxMessageBox(L"Unable to create pos window");
		return FALSE;
	}
	m_hPosWndHandle = pWnd->GetSafeHwnd();
	*/

	return TRUE;
}

void CMainApp::SendPosMessage(int key, LPCWSTR szMessage)
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
	if (m_hPosThreadHandle) {
		::TerminateThread(m_hPosThreadHandle, 0);
		::WaitForSingleObject(m_hPosThreadHandle, 100);
	}

	AfxOleTerm(FALSE);

	if (CCefApplication::IsInit()) {
		CCefApplication::Destroy();
	}

	return __super::ExitInstance();
}


// CMainApp message handlers

void CMainApp::OnFileNewFrame() 
{
	ASSERT(m_pDocTemplate != NULL);

	CDocument* pDoc = NULL;
	CFrameWnd* pFrame = NULL;

	// Create a new instance of the document referenced
	// by the m_pDocTemplate member.
	if (m_pDocTemplate != NULL)
		pDoc = m_pDocTemplate->CreateNewDocument();

	if (pDoc != NULL)
	{
		// If creation worked, use create a new frame for
		// that document.
		pFrame = m_pDocTemplate->CreateNewFrame(pDoc, NULL);
		if (pFrame != NULL)
		{
			// Set the title, and initialize the document.
			// If document initialization fails, clean-up
			// the frame window and document.

			m_pDocTemplate->SetDefaultTitle(pDoc);
			if (!pDoc->OnNewDocument())
			{
				pFrame->DestroyWindow();
				pFrame = NULL;
			}
			else
			{
				// Otherwise, update the frame
				m_pDocTemplate->InitialUpdateFrame(pFrame, pDoc, TRUE);
			}
		}
	}

	// If we failed, clean up the document and show a
	// message to the user.

	if (pFrame == NULL || pDoc == NULL)
	{
		delete pDoc;
		AfxMessageBox(AFX_IDP_FAILED_TO_CREATE_DOC);
	}
}

void CMainApp::OnFileNew() 
{
	CDocument* pDoc = NULL;
	CFrameWnd* pFrame;
	pFrame = DYNAMIC_DOWNCAST(CFrameWnd, CWnd::GetActiveWindow());
	
	if (pFrame != NULL)
		pDoc = pFrame->GetActiveDocument();

	if (pFrame == NULL || pDoc == NULL)
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
		ASSERT(pTemplate != NULL);

		if (pTemplate != NULL)
			pTemplate->SetDefaultTitle(pDoc);
		pDoc->OnNewDocument();
	}
}

