
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

class CMainApp : public CA2WinApp
{
public:
	CMainApp();


// Overrides
public:
	virtual BOOL InitInstance() override;
	virtual int ExitInstance() override;

protected:
	DECLARE_MESSAGE_MAP()
};

extern CMainApp theApp;
