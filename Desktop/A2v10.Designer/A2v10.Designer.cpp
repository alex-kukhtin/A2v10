// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


#include "stdafx.h"
#include "A2v10.Designer.h"
#include "mainfrm.h"

#include "childfrm.h"

#include "moduledoc.h"
#include "sciview.h"
#include "moduleview.h"
#include "a2formdoc.h"
#include "formitem.h"
#include "a2formview.h"
#include "a2formtab.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#pragma comment(lib,"../../bin/A2v10.Base.lib")
#pragma comment(lib,"../../bin/A2v10.Net.Shim.lib")

// CMainApp

BEGIN_MESSAGE_MAP(CMainApp, CA2WinApp)
	// Standard file based document commands
	ON_COMMAND(ID_FILE_NEW, OnFileNew)
	ON_COMMAND(ID_FILE_OPEN, OnFileOpen)
	// Standard print setup command
	ON_COMMAND(ID_FILE_PRINT_SETUP, OnFilePrintSetup)
END_MESSAGE_MAP()


// CMainApp construction

CMainApp::CMainApp()
	: CA2WinApp()
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
	SetAppID(_T("A2v10.Designer.AppID.NoVersion"));

}

// The one and only CMainApp object

CMainApp theApp;


// CMainApp initialization

BOOL CMainApp::InitInstance()
{
	if (!__super::InitInstance())
		return FALSE;

	// Register the application's document templates.  Document templates
	//  serve as the connection between documents, frame windows and views
	try 
	{
		CA2DocTemplate* pModuleTemplate = new CA2DocTemplate(IDR_JSMODULE,
			RUNTIME_CLASS(CModuleDoc),
			RUNTIME_CLASS(CChildFrame), // custom MDI child frame
			RUNTIME_CLASS(CModuleView));
		AddDocTemplate(pModuleTemplate);

		CA2DocTemplate* pFormTemplate = new CA2DocTemplate(IDR_FORM,
			RUNTIME_CLASS(CA2FormDocument),
			RUNTIME_CLASS(CChildFrame), //
			RUNTIME_CLASS(CA2FormTabView));
		AddDocTemplate(pFormTemplate);
	}
	catch (std::bad_alloc&) {
		return FALSE;
	}

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
		JavaScriptRuntime::CreateGlobalObject();
		CDotNetRuntime::LoadLibrary();
		JavaScriptRuntime::StartDebugging();
	}
	catch (CDotNetException& de)
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
	try
	{
		CDotNetRuntime::Stop();
	}
	catch (CDotNetException& /*de*/)
	{
		// do nothing
	}

	return __super::ExitInstance();
}

// CMainApp message handlers



