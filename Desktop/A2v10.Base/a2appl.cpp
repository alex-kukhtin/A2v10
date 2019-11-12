// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.


#include "stdafx.h"

#include "../include/appdefs.h"
#include "../include/appdata.h"
#include "../include/a2appl.h"
#include "../include/optionsps.h"

#include "appabout.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

CA2WinApp::CA2WinApp()
	: CWinAppEx(FALSE /* no smart update*/)
{
	CDockablePane::m_bDisableAnimation = TRUE;
}

CA2WinApp::~CA2WinApp()
{
}

BEGIN_MESSAGE_MAP(CA2WinApp, CWinAppEx)
	ON_COMMAND(ID_FILE_SAVE_ALL, OnFileSaveAll)
	// Windows
	ON_COMMAND(ID_WINDOW_CLOSE_ALL, OnCloseAllDocuments)
	ON_UPDATE_COMMAND_UI(ID_WINDOW_CLOSE_ALL, OnUpdateCloseAllDocuments)
	// Tools
	ON_COMMAND(ID_TOOLS_OPTIONS, OnToolsOptions)
	ON_COMMAND(ID_APP_ABOUT, OnAppAbout)
	ON_COMMAND(ID_APP_LICENSE, OnAppLicense)
END_MESSAGE_MAP()

// virtual 
BOOL CA2WinApp::InitInstance()
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

	if (!__super::InitInstance())
		return FALSE;

	if (!AfxInitRichEdit5()) {
		AfxMessageBox(IDP_RICH_INIT_FAILED);
		return FALSE;
	}

	HMODULE hModule = ::LoadLibrary(L"scintilla.dll");
	if (!hModule) {
		AfxMessageBox(IDP_SCI_INIT_FAILED);
		return FALSE;
	}

	SetRegistryKey(L"A2v10"); // before lang
	LoadLangLibrary();

	LoadStdProfileSettings(16);  // Load standard INI file options (including MRU)

	EnableTaskbarInteraction();

	InitContextMenuManager(); // needed for tab menu
	InitShellManager();

	// do not use Keyboard Manager - we need default accelerators
	//InitKeyboardManager();

	InitTooltipManager();
	CMFCToolTipInfo ttParams;
	ttParams.m_bVislManagerTheme = TRUE;
	GetTooltipManager()->SetTooltipParams(AFX_TOOLTIP_TYPE_ALL,
		RUNTIME_CLASS(CMFCToolTipCtrl), &ttParams);

	return TRUE;
}

//virtual 
int CA2WinApp::ExitInstance() {
	return __super::ExitInstance();
}

void CA2WinApp::LoadLangLibrary()
{
	LPCWSTR szLang = CAppData::GetCurrentUILangCode();
	CString libName;
	libName.Format(L"A2v10.Locale.%s.dll", szLang);
	VERIFY(AfxLoadLibrary(libName));
}

// Customization load/save methods
// virtual
void CA2WinApp::PreLoadState()
{
}

// virtual
void CA2WinApp::LoadCustomState()
{
}

// virtual
void CA2WinApp::SaveCustomState()
{
}

// afx_msg
void CA2WinApp::OnAppAbout()
{
	CAppAboutDialog dlg;
	dlg.DoModal();
}

// virtual 
void CA2CommandLineInfo::ParseParam(const TCHAR* pszParam, BOOL bFlag, BOOL bLast)
{
	CString strParam(pszParam);
	if (bFlag && (strParam.CompareNoCase(L"DEBUG") == 0))
	{
		m_bDebug = true;
		return;
	}
	__super::ParseParam(pszParam, bFlag, bLast);
}


// afx_msg
void CA2WinApp::OnCloseAllDocuments()
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
void CA2WinApp::OnUpdateCloseAllDocuments(CCmdUI* pCmdUI)
{
	pCmdUI->Enable(m_pDocManager->GetOpenDocumentCount() > 0);
}

// afx_msg
void CA2WinApp::OnFileSaveAll()
{
	POSITION tmlPos = m_pDocManager->GetFirstDocTemplatePosition();
	while (tmlPos) {
		CDocTemplate* pTml = m_pDocManager->GetNextDocTemplate(tmlPos);
		POSITION docPos = pTml->GetFirstDocPosition();
		while (docPos) {
			pTml->GetNextDoc(docPos)->OnCmdMsg(ID_FILE_SAVE, CN_COMMAND, NULL, NULL);
		}
	}
}

// afx_msg
void CA2WinApp::OnToolsOptions()
{
	COptionsPropertySheet::DoOptions(COptionsPropertySheet::page_all);
}

// afx_msg
void CA2WinApp::OnAppLicense()
{
	AfxMessageBox(L"License here");
}