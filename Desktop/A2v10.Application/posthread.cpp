// Copyright © 2020 Alex Kukhtin. All rights reserved.


#include "stdafx.h"

#include "posthread.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


IMPLEMENT_DYNCREATE(CPosThreadWnd, CWinThread)

CPosThreadWnd::CPosThreadWnd()
{
	m_hFrame = AfxGetApp()->m_pMainWnd->GetSafeHwnd();
}

BOOL CPosThreadWnd::InitInstance()
{
	__super::InitInstance();
	m_hFrame = AfxGetApp()->m_pMainWnd->GetSafeHwnd();
	return TRUE;
}

BEGIN_MESSAGE_MAP(CPosThreadWnd, CWinThread)
	ON_THREAD_MESSAGE(WMI_POS_COMMAND_SEND, OnPosCommand)
END_MESSAGE_MAP()

static CString s_cmd;

// afx_msg
void CPosThreadWnd::OnPosCommand(WPARAM wParam, LPARAM lParam)
{
	LPCWSTR szCommand = reinterpret_cast<LPCWSTR>(lParam);
	s_cmd = szCommand;
	// RunCommand
	::Sleep(500);
	::PostMessage(m_hFrame, WMI_POS_COMMAND_RESULT, wParam, (LPARAM)(LPCWSTR) s_cmd);
}

