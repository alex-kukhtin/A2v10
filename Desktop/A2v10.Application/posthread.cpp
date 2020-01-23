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

static CString s_result;

// afx_msg
void CPosThreadWnd::OnPosCommand(WPARAM wParam, LPARAM lParam)
{
	const wchar_t* szCommand = reinterpret_cast<const wchar_t*>(lParam);
	// RunCommand
	std::wstring result;
	pos_result_t rc = PosProcessCommand(szCommand, result);
	BOOL rcBool = rc == pos_result_t::_success ? TRUE : FALSE;
	s_result = ProcessResult(rc, result.c_str());
	::PostMessage(m_hFrame, WMI_POS_COMMAND_RESULT, MAKEWPARAM(wParam, rcBool), (LPARAM) (LPCWSTR) s_result);
}

CString CPosThreadWnd::ProcessResult(pos_result_t rc, const wchar_t* result)
{
	const wchar_t* r = result && *result ? result : L"{}";
	CString msg(r);
	switch (rc)
	{
	case _success:
		break;
	case _invalid_json:
		break;
	case _could_not_connect:
		msg = L"{\"message\":\"Printer not connected\"}";
		break;
	case _already_connected:
		msg = L"{\"message\":\"Printer aready connected\"}";
		break;
	default:
		break;
	}
	return msg;
}

