
// A2v10.Application.h : main header file for the A2v10.Application application
//
#pragma once

#ifndef __AFXWIN_H__
	#error "include 'stdafx.h' before including this file for PCH"
#endif


#include "resource.h"       // main symbols

class CAppConfig;

class CAppTraceTarget : public ITraceTarget
{
public:
	HWND m_hWnd;
	virtual void Trace(TraceType type, const wchar_t* message) override;
};

class CMainApp : public CA2WinApp
{
public:
	CMainApp();

	CString m_strUdlFileName;
	CString m_strInitialUrl;
	CString m_strConnectionString;
	CAppTraceTarget _traceTarget;
protected:
	CMultiDocTemplate* m_pDocTemplate;
	DWORD m_dwPosThreadId;
	HANDLE m_hPosThreadHandle;
	CAppConfig* m_pAppConfig;
public:
	virtual BOOL InitInstance() override;
	virtual int ExitInstance() override;
	virtual BOOL PumpMessage() override;

	void PostPosThreadMessage(int key, LPCWSTR szMessage);

protected:
	afx_msg void OnFileNew();

	DECLARE_MESSAGE_MAP()

	void StartPosThread();
	CAppConfig* LoadConfigFile(LPCWSTR szConfig);
};


extern CMainApp theApp;
