
// A2v10.Designer.cpp : Defines the class behaviors for the application.
//

#include "stdafx.h"
#include "afxwinappex.h"
#include "afxdialogex.h"
#include "A2v10.Designer.h"
#include "mainfrm.h"

#include "childfrm.h"

#include "A2v10.DesignerDoc.h"
#include "A2v10.DesignerView.h"

#include "moduledoc.h"
#include "sciview.h"
#include "moduleview.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#pragma comment(lib,"../../bin/A2v10.Base.lib")
#pragma comment(lib,"../../bin/A2v10.Net.Shim.lib")

// CMainApp

BEGIN_MESSAGE_MAP(CMainApp, CWinAppEx)
	ON_COMMAND(ID_APP_ABOUT, &CMainApp::OnAppAbout)
	// Standard file based document commands
	ON_COMMAND(ID_FILE_NEW, OnFileNew)
	ON_COMMAND(ID_FILE_OPEN, OnFileOpen)
	// Windows
	ON_COMMAND(ID_WINDOW_CLOSE_ALL, OnCloseAllDocuments)
	ON_UPDATE_COMMAND_UI(ID_WINDOW_CLOSE_ALL, OnUpdateCloseAllDocuments)
	// Standard print setup command
	ON_COMMAND(ID_FILE_PRINT_SETUP, OnFilePrintSetup)
	ON_COMMAND(ID_TOOLS_OPTIONS, OnToolsOptions)
END_MESSAGE_MAP()


// CMainApp construction

CMainApp::CMainApp()
{
	m_bHiColorIcons = TRUE;
	CDockablePane::m_bDisableAnimation = TRUE;

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
	SetAppID(_T("A2v10.Designer.AppID.NoVersion"));

	// TODO: add construction code here,
	// Place all significant initialization in InitInstance
}

// The one and only CMainApp object

CMainApp theApp;


// CMainApp initialization

BOOL CMainApp::InitInstance()
{
	// InitCommonControlsEx() is required on Windows XP if an application
	// manifest specifies use of ComCtl32.dll version 6 or later to enable
	// visual styles.  Otherwise, any window creation will fail.
	INITCOMMONCONTROLSEX InitCtrls;
	InitCtrls.dwSize = sizeof(InitCtrls);
	// Set this to include all the common control classes you want to use
	// in your application.
	InitCtrls.dwICC = ICC_WIN95_CLASSES;
	InitCommonControlsEx(&InitCtrls);

	__super::InitInstance();

	if (!AfxInitRichEdit5()) {
		AfxMessageBox(IDP_RICH_INIT_FAILED);
		return FALSE;
	}

	HMODULE hModule = ::LoadLibrary(L"scintilla.dll");
	if (!hModule) {
		AfxMessageBox(IDP_SCI_INIT_FAILED);
		return FALSE;
	}

	SetRegistryKey(L"A2v10.Designer"); // before lang
	LoadLangLibrary();

	LoadStdProfileSettings(16);  // Load standard INI file options (including MRU)

	EnableTaskbarInteraction();

	//InitContextMenuManager();
	InitShellManager();

	// do not use Keyboard Manager - we need default accelerators
	//InitKeyboardManager();

	InitTooltipManager();
	CMFCToolTipInfo ttParams;
	ttParams.m_bVislManagerTheme = TRUE;
	theApp.GetTooltipManager()->SetTooltipParams(AFX_TOOLTIP_TYPE_ALL,
		RUNTIME_CLASS(CMFCToolTipCtrl), &ttParams);

	// Register the application's document templates.  Document templates
	//  serve as the connection between documents, frame windows and views
	CMultiDocTemplate* pDocTemplate;
	pDocTemplate = new CA2DocTemplate(IDR_A2v10DesignerTYPE,
		RUNTIME_CLASS(CModuleDoc),
		RUNTIME_CLASS(CChildFrame), // custom MDI child frame
		RUNTIME_CLASS(CModuleView));
	if (!pDocTemplate)
		return FALSE;
	AddDocTemplate(pDocTemplate);

	// create main MDI Frame window
	CMainFrame* pMainFrame = new CMainFrame;
	if (!pMainFrame || !pMainFrame->LoadFrame(IDR_MAINFRAME))
	{
		delete pMainFrame;
		return FALSE;
	}
	m_pMainWnd = pMainFrame;


	// Parse command line for standard shell commands, DDE, file open
	CA2CommandLineInfo cmdInfo;
	ParseCommandLine(cmdInfo);

	CAppData::SetDebug(cmdInfo.IsDebugMode());

	// Dispatch commands specified on the command line.  Will return FALSE if
	// app was launched with /RegServer, /Register, /Unregserver or /Unregister.
	//if (!ProcessShellCommand(cmdInfo))
		//return FALSE;

	try
	{
		CDotNetRuntime::Start();
		//JavaScriptRuntime::CreateGlobalObject();
		//JavaScriptRuntime::StartDebugging();
	}
	catch (CDotNetException de)
	{
		de.ReportError();
		return FALSE;
	}

	// The main window has been initialized, so show and update it
	pMainFrame->ShowWindow(m_nCmdShow);
	pMainFrame->UpdateWindow();

	return TRUE;
}

int CMainApp::ExitInstance()
{
	//TODO: handle additional resources you may have added
	try
	{
		CDotNetRuntime::Stop();
	}
	catch (CDotNetException /*de*/)
	{
		// do nothing
	}

	return __super::ExitInstance();
}


void CMainApp::LoadLangLibrary()
{
	int lang = CAppData::GetCurrentUILang();
	if (lang == 0)
		VERIFY(AfxLoadLibrary(L"A2v10.Locale.Uk.dll"));
	else if (lang == 1)
		VERIFY(AfxLoadLibrary(L"A2v10.Locale.En.dll"));
	else if (lang == 2)
		VERIFY(AfxLoadLibrary(L"A2v10.Locale.Ru.dll"));
}

// CMainApp message handlers


// CAboutDlg dialog used for App About

class CAboutDlg : public CDialogEx
{
public:
	CAboutDlg();

// Dialog Data
#ifdef AFX_DESIGN_TIME
	enum { IDD = IDD_ABOUTBOX };
#endif

protected:
	virtual void DoDataExchange(CDataExchange* pDX);    // DDX/DDV support

// Implementation
protected:
	DECLARE_MESSAGE_MAP()
};

CAboutDlg::CAboutDlg() : CDialogEx(IDD_ABOUTBOX)
{
}

void CAboutDlg::DoDataExchange(CDataExchange* pDX)
{
	CDialogEx::DoDataExchange(pDX);
}

BEGIN_MESSAGE_MAP(CAboutDlg, CDialogEx)
END_MESSAGE_MAP()

// App command to run the dialog
void CMainApp::OnAppAbout()
{
	CAboutDlg aboutDlg;
	aboutDlg.DoModal();
}

// CMainApp customization load/save methods

void CMainApp::PreLoadState()
{
	BOOL bNameValid;
	CString strName;
	bNameValid = strName.LoadString(IDS_EDIT_MENU);
	ASSERT(bNameValid);
	GetContextMenuManager()->AddMenu(strName, IDR_POPUP_EDIT);
	bNameValid = strName.LoadString(IDS_EXPLORER);
	ASSERT(bNameValid);
	GetContextMenuManager()->AddMenu(strName, IDR_POPUP_EXPLORER);
}

void CMainApp::LoadCustomState()
{
}

void CMainApp::SaveCustomState()
{
}

// afx_msg
void CMainApp::OnCloseAllDocuments()
{
	POSITION pos = m_pDocManager->GetFirstDocTemplatePosition();
	while (pos) {
		CDocTemplate* pTempl = m_pDocManager->GetNextDocTemplate(pos);
		POSITION docPos = pTempl->GetFirstDocPosition();
		while (docPos)
		{
			CDocument* pDoc = pTempl->GetNextDoc(docPos);
			if (pDoc->SaveModified())
				pDoc->OnCloseDocument();
		}
	}
}

// afx_msg 
void CMainApp::OnUpdateCloseAllDocuments(CCmdUI* pCmdUI)
{
	pCmdUI->Enable(m_pDocManager->GetOpenDocumentCount() > 0);
}


// afx_msg
void CMainApp::OnToolsOptions() 
{
	COptionsPropertySheet::DoOptions(COptionsPropertySheet::page_all);
}
