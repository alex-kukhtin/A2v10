// Copyright © 2008-2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"

#include "../include/uitools.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


#define CONSOLAS_FONT L"Consolas"

// static 
void CUITools::TrackPopupMenu(UINT nMenu, int nSubMenu, CWnd* pWnd, CPoint point, bool alignRight /*= false*/)
{
	CMenu menu;
	menu.LoadMenu(nMenu);

	CMenu* pSubMenu = menu.GetSubMenu(nSubMenu);
	ATLASSERT(pSubMenu != NULL);

	CWnd* pFrame= AfxGetMainWnd();
	ATLASSERT(pFrame);

	CMFCPopupMenu* pPopupMenu = new CMFCPopupMenu;

	if (!pPopupMenu->Create(pWnd, point.x, point.y,
		(HMENU)pSubMenu->GetSafeHmenu(), FALSE, TRUE))
		return;

	if (alignRight) {
		CRect wr;
		pPopupMenu->GetWindowRect(wr);
		pPopupMenu->SetWindowPos(nullptr, wr.left - wr.Width(), wr.top, 0, 0, SWP_NOSIZE | SWP_NOZORDER);
	}

	if (pFrame->IsKindOf(RUNTIME_CLASS(CMDIFrameWndEx)))
	{

		((CMDIFrameWndEx*)AfxGetMainWnd())->OnShowPopupMenu(pPopupMenu);
		pWnd->UpdateDialogControls(pWnd, FALSE);
	}
	else if (pFrame->IsKindOf(RUNTIME_CLASS(CFrameWndEx))) 
	{
		((CFrameWndEx*)AfxGetMainWnd())->OnShowPopupMenu(pPopupMenu);
		pWnd->UpdateDialogControls(pWnd, FALSE);
	}
	else {
		ATLASSERT(FALSE);
	}
}

static CString s_strMonoSpace;

static int CALLBACK enumFontFamProc(ENUMLOGFONTEX *lpelfe, NEWTEXTMETRICEX *lpntme, DWORD FontType, LPARAM lParam)
{
	s_strMonoSpace = CONSOLAS_FONT; // installed
	return 0L;
}

// static 
CString CUITools::GetMonospaceFontFamily()
{
	if (s_strMonoSpace.IsEmpty())
	{
		s_strMonoSpace = L"Courier New";
		// try Consolas font
		CWindowDC dc(NULL);
		LOGFONT lf = { 0 };
		lf.lfCharSet = RUSSIAN_CHARSET;
		_tcscpy_s(lf.lfFaceName, LF_FACESIZE, CONSOLAS_FONT);
		::EnumFontFamiliesEx(dc.GetSafeHdc(), &lf, (FONTENUMPROCW)enumFontFamProc, 0, 0);
	}
	return s_strMonoSpace;
}

// static 
BOOL CUITools::TryDoCmdMsg(UINT nID, int nCode, void* pExtra, AFX_CMDHANDLERINFO* pHandlerInfo)
{
	// process active pane
	HWND hWndFocus = ::GetFocus();
	CWnd* pActivePane = NULL;
	CRuntimeClass* pClass = RUNTIME_CLASS(CPane);
	while (hWndFocus != NULL) {
		CWnd* pWnd = CWnd::FromHandle(hWndFocus);
		if (pWnd && pWnd->IsKindOf(pClass)) {
			pActivePane = pWnd;
			break;
		}
		hWndFocus = ::GetParent(hWndFocus);
	}
	if (pActivePane && pActivePane->OnCmdMsg(nID, nCode, pExtra, pHandlerInfo))
		return TRUE;
	return FALSE;
}

