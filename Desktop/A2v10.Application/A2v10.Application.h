
// A2v10.Application.h : main header file for the A2v10.Application application
//
#pragma once

#ifndef __AFXWIN_H__
	#error "include 'stdafx.h' before including this file for PCH"
#endif


#include "resource.h"       // main symbols


class CPosThread;

class CMainApp : public CA2WinApp
{
public:
	CMainApp();

	CString m_strUdlFileName;
	CString m_strInitialUrl;

protected:
	CMultiDocTemplate* m_pDocTemplate;
	DWORD m_dwPosThreadId;
	HANDLE m_hPosThreadHandle;

public:
	virtual BOOL InitInstance() override;
	virtual int ExitInstance() override;
	virtual BOOL PumpMessage() override;

	void SendPosMessage(int key, LPCWSTR szMessage);

protected:
	afx_msg void OnFileNewFrame();
	afx_msg void OnFileNew();
	DECLARE_MESSAGE_MAP()
};


extern CMainApp theApp;
