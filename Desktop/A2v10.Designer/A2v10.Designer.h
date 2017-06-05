
// A2v10.Designer.h : main header file for the A2v10.Designer application
//
#pragma once

#ifndef __AFXWIN_H__
	#error "include 'stdafx.h' before including this file for PCH"
#endif

#include "resource.h"       // main symbols


// CMainApp:
// See A2v10.Designer.cpp for the implementation of this class
//

class CMainApp : public CWinAppEx
{
public:
	CMainApp();


// Overrides
public:
	virtual BOOL InitInstance();
	virtual int ExitInstance();

// Implementation
	BOOL  m_bHiColorIcons;

	virtual void PreLoadState();
	virtual void LoadCustomState();
	virtual void SaveCustomState();

	afx_msg void OnAppAbout();
	DECLARE_MESSAGE_MAP()

	afx_msg void OnCloseAllDocuments();
	afx_msg void OnUpdateCloseAllDocuments(CCmdUI* pCmdUI);
};

extern CMainApp theApp;
