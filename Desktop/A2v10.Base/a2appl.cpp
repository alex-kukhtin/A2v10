

#include "stdafx.h"

#include "../include/appdefs.h"
#include "../include/appdata.h"
#include "../include/a2appl.h"

#include "appabout.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

CA2WinApp::CA2WinApp()
	: CWinAppEx(FALSE /* no smart update*/)
{
}

CA2WinApp::~CA2WinApp()
{
}

BEGIN_MESSAGE_MAP(CA2WinApp, CWinAppEx)
	ON_COMMAND(ID_APP_ABOUT, OnAppAbout)
	ON_COMMAND(ID_FILE_SAVE_ALL, OnFileSaveAll)
	// Windows
	ON_COMMAND(ID_WINDOW_CLOSE_ALL, OnCloseAllDocuments)
	ON_UPDATE_COMMAND_UI(ID_WINDOW_CLOSE_ALL, OnUpdateCloseAllDocuments)
END_MESSAGE_MAP()

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

