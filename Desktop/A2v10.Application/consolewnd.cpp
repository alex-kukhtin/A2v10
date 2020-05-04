// Copyright © 2020 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "A2v10.Application.h"
#include "consolewnd.h"

CConsoleWnd::CConsoleWnd()
{
	m_wndToolBar.SetUpdateCmdUIByOwner(TRUE);
}

CConsoleWnd::~CConsoleWnd()
{
}


BEGIN_MESSAGE_MAP(CConsoleWnd, CA2DockablePane)
	ON_WM_SETFOCUS()
	ON_WM_SIZE()
	ON_WM_CREATE()
	ON_WM_CONTEXTMENU()
	ON_COMMAND(ID_EDIT_COPY, OnEditCopy)
	ON_UPDATE_COMMAND_UI(ID_EDIT_COPY, OnUpdateEditCopy)
	ON_COMMAND(ID_EDIT_CLEAR_ALL, OnEditClearAll)
END_MESSAGE_MAP()

int CConsoleWnd::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;

	DWORD dwEditStyleEx = 0;

	DWORD dwEditStyle = WS_CHILD | WS_VISIBLE | ES_MULTILINE |
		WS_HSCROLL | WS_VSCROLL | ES_READONLY |
		ES_AUTOVSCROLL | ES_NOHIDESEL | ES_SAVESEL |
		ES_SELECTIONBAR | ES_AUTOHSCROLL;

	CRect rect(0, 0, 100, 100);
	// necessary to avoid bug with ES_SELECTIONBAR and zero for cx and cy
	if (!m_wndRichEdit.CreateEx(dwEditStyleEx, dwEditStyle, rect, this, AFX_IDW_PANE_FIRST))
		return -1;

	CString strfontFamily = CUITools::GetMonospaceFontFamily();
	CHARFORMAT2W cfDefault;
	memset(&cfDefault, 0, sizeof(CHARFORMAT2W));
	cfDefault.cbSize = sizeof(CHARFORMAT2W);
	cfDefault.dwEffects = CFE_PROTECTED;
	cfDefault.dwMask = CFM_BOLD | CFM_FACE | CFM_SIZE |
		CFM_CHARSET | CFM_PROTECTED;
	cfDefault.yHeight = 180;
	cfDefault.bCharSet = RUSSIAN_CHARSET;
	_tcscpy_s(cfDefault.szFaceName, LF_FACESIZE, strfontFamily);

	m_wndRichEdit.SetDefaultCharFormat(cfDefault);
	m_wndRichEdit.SetBackgroundColor(FALSE, RGB(230, 231, 232));
	m_wndRichEdit.SetOptions(ECOOP_OR, ECO_NOHIDESEL);

	m_wndToolBar.Create(this, AFX_DEFAULT_TOOLBAR_STYLE);
	m_wndToolBar.LoadToolBar(IDR_WND_CONSOLE, 0, 0, TRUE /* Is locked */);
	m_wndToolBar.SetPaneStyle(m_wndToolBar.GetPaneStyle() | CBRS_TOOLTIPS);
	m_wndToolBar.SetPaneStyle(m_wndToolBar.GetPaneStyle() & ~(CBRS_GRIPPER | CBRS_SIZE_DYNAMIC | CBRS_BORDER_TOP | CBRS_BORDER_BOTTOM | CBRS_BORDER_LEFT | CBRS_BORDER_RIGHT));

	m_wndToolBar.SetOwner(this);
	m_wndToolBar.SetRouteCommandsViaFrame(FALSE);

	AdjustLayout();
	return 0L;
}

void CConsoleWnd::AdjustLayout()
{
	CRect rectClient;
	GetClientRect(rectClient);
	AdjustBorder(rectClient);

	int cyTlb = m_wndToolBar.CalcFixedLayout(FALSE, TRUE).cy;

	m_wndToolBar.SetWindowPos(NULL, rectClient.left, rectClient.top, rectClient.Width(), cyTlb, SWP_NOACTIVATE | SWP_NOZORDER);
	m_wndRichEdit.SetWindowPos(NULL, rectClient.left, rectClient.top + cyTlb, rectClient.Width(), rectClient.Height() - cyTlb, SWP_NOACTIVATE | SWP_NOZORDER);
}

// afx_msg
void CConsoleWnd::OnSize(UINT nType, int cx, int cy)
{
	__super::OnSize(nType, cx, cy);
	AdjustLayout();
}

// afx_msg
void CConsoleWnd::OnSetFocus(CWnd* pOldWnd)
{
	__super::OnSetFocus(pOldWnd);
	m_wndRichEdit.SetFocus();
}

// afx_msg
void CConsoleWnd::OnContextMenu(CWnd* pWnd, CPoint point)
{
	if (pWnd->GetSafeHwnd() != m_wndRichEdit.GetSafeHwnd())
	{
		__super::OnContextMenu(pWnd, point);
		return;
	}
	m_wndRichEdit.SetFocus();
	CUITools::TrackPopupMenu(IDM_POPUP_MENU, IDM_POPUP_CONSOLE_INDEX, this, point);
}

// afx_msg
void CConsoleWnd::OnEditCopy()
{
	m_wndRichEdit.Copy();
}

// afx_msg
void CConsoleWnd::OnUpdateEditCopy(CCmdUI* pCmdUI)
{
	CHARRANGE cr;
	m_wndRichEdit.GetSel(cr);
	pCmdUI->Enable(cr.cpMin != cr.cpMax);
}

// afx_msg 
void CConsoleWnd::OnEditClearAll()
{
	m_wndRichEdit.LockWindowUpdate();
	m_wndRichEdit.SetSel(0, -1);
	m_wndRichEdit.ReplaceSel(L"");
	m_wndRichEdit.SetSel(1, 1);
	m_wndRichEdit.UnlockWindowUpdate();
}

void CConsoleWnd::WriteToConsole(ConsoleMsgType type, LPCWSTR szMessage)
{
	CString strResult(szMessage);
	strResult += L"\r";
	m_wndRichEdit.SetSel(-1, -1);
	m_wndRichEdit.ReplaceSel(strResult);
}
