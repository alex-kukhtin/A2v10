// commandwnd.cpp : implementation file
//

#include "stdafx.h"
#include "A2v10.Designer.h"
#include "commandwnd.h"

/**** TODO:
1. IntelliSense
2. 
*/


#define COMMAND_PROMPT L"\r>"
#define BUFFER_SIZE 100

BEGIN_MESSAGE_MAP(CA2CommandEdit, CRichEditCtrl)
	ON_MESSAGE(WMI_FILL_PROPS, OnWmiFillProps)
END_MESSAGE_MAP()


// afx_msg
LRESULT CA2CommandEdit::OnWmiFillProps(WPARAM wParam, LPARAM lParam)
{
	if (wParam != WMI_FILL_PROPS_WPARAM)
		return 0L;
	return (LRESULT)WMI_FILL_PROPS_RESULT_SKIP;
}

CCommandWnd::CCommandWnd()
: m_bSkipEnProtect(false), m_cmdBufferIndex(-1)
{

}

CCommandWnd::~CCommandWnd()
{
}


BEGIN_MESSAGE_MAP(CCommandWnd, CA2DockablePane)
	ON_WM_SETFOCUS()
	ON_NOTIFY(EN_MSGFILTER, AFX_IDW_PANE_FIRST, OnEnMsgFilter)
	ON_NOTIFY(EN_PROTECTED, AFX_IDW_PANE_FIRST, OnEnProtected)
	ON_WM_SIZE()
	ON_WM_CREATE()
	ON_WM_CONTEXTMENU()
	ON_COMMAND(ID_EDIT_COPY, OnEditCopy)
	ON_UPDATE_COMMAND_UI(ID_EDIT_COPY, OnUpdateEditCopy)
	ON_COMMAND(ID_EDIT_CUT, OnEditCut)
	ON_UPDATE_COMMAND_UI(ID_EDIT_CUT, OnUpdateEditCut)
	ON_COMMAND(ID_EDIT_PASTE, OnEditPaste)
	ON_UPDATE_COMMAND_UI(ID_EDIT_PASTE, OnUpdateEditPaste)
	ON_COMMAND(ID_EDIT_CLEAR_ALL, OnEditClearAll)
	ON_COMMAND(ID_EDIT_UNDO, OnEditUndo)
	ON_UPDATE_COMMAND_UI(ID_EDIT_UNDO, OnUpdateEditUndo)
	ON_COMMAND(ID_EDIT_REDO, OnEditRedo)
	ON_UPDATE_COMMAND_UI(ID_EDIT_REDO, OnUpdateEditRedo)
END_MESSAGE_MAP()

// virtual
BOOL CCommandWnd::PreTranslateMessage(MSG* pMsg)
{
	// prevent close by Esc
	if ((pMsg->message == WM_KEYDOWN) && (pMsg->wParam == VK_ESCAPE) && (pMsg->hwnd == m_wndRichEdit.GetSafeHwnd()))
		return TRUE;
	return __super::PreTranslateMessage(pMsg);
}

void CCommandWnd::AdjustLayout()
{
	CRect rectClient;
	GetClientRect(rectClient);
	m_wndRichEdit.SetWindowPos(NULL, rectClient.left, rectClient.top, rectClient.Width(), rectClient.Height(), SWP_NOZORDER);
}


int CCommandWnd::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;

	DWORD dwEditStyleEx = 0;

	DWORD dwEditStyle = WS_CHILD | WS_VISIBLE | ES_MULTILINE |
		WS_HSCROLL | WS_VSCROLL |
		ES_AUTOVSCROLL | ES_NOHIDESEL | ES_SAVESEL |
		ES_SELECTIONBAR | ES_AUTOHSCROLL | ES_WANTRETURN;

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
	m_wndRichEdit.SetEventMask(ENM_KEYEVENTS | ENM_PROTECTED);
	m_wndRichEdit.SetOptions(ECOOP_OR, ECO_WANTRETURN | ECO_NOHIDESEL);
	m_wndRichEdit.SetTextMode(TM_RICHTEXT | TM_MULTILEVELUNDO);

	m_wndRichEdit.SetSel(0, 0);
	m_wndRichEdit.ReplaceSel(L">");
	m_wndRichEdit.SetSel(1, 1);

	AdjustLayout();
	return 0L;
}


// afx_msg
void CCommandWnd::OnSize(UINT nType, int cx, int cy)
{
	__super::OnSize(nType, cx, cy);
	AdjustLayout();
}

// afx_msg
void CCommandWnd::OnSetFocus(CWnd* pOldWnd)
{
	__super::OnSetFocus(pOldWnd);
	m_wndRichEdit.SetFocus();
}

void CCommandWnd::OnEnProtected(NMHDR* pNMHDR, LRESULT* pResult)
{
	if (m_bSkipEnProtect)
	{
		*pResult = FALSE;
		return;
	}
	int iIndex = m_wndRichEdit.LineIndex();
	int cnt = m_wndRichEdit.GetLineCount();
	if (iIndex == (cnt - 1)) {
		// editing last line only
		*pResult = FALSE;
		return;
	}
	*pResult = TRUE;
}

// afx_msg
void CCommandWnd::OnEnMsgFilter(NMHDR* pNMHDR, LRESULT* pResult)
{
	*pResult = FALSE;
	MSGFILTER* pMsgFilter = reinterpret_cast<MSGFILTER*>(pNMHDR);
	if ((::GetAsyncKeyState(VK_SHIFT) < 0) || (GetAsyncKeyState(VK_CONTROL) < 0))
		return;
	if (pMsgFilter->msg == WM_KEYDOWN) {
		if (pMsgFilter->wParam == VK_RETURN) {
			ProcessCurrentLine();
			*pResult = TRUE;
		}
		else if (pMsgFilter->wParam == VK_BACK) 
		{
			BOOL bFirstChar = FALSE;
			if (!IsLastLine(bFirstChar))
				*pResult = TRUE; // prevent
			if (bFirstChar)
				*pResult = TRUE;
		}
		else if (pMsgFilter->wParam == VK_LEFT)
		{
			BOOL bFirstChar = FALSE;
			if (IsLastLine(bFirstChar) && bFirstChar)
				*pResult = TRUE; // prevent
		}
		else if (pMsgFilter->wParam == VK_HOME)
		{
			BOOL bFirstChar = FALSE;
			if (IsLastLine(bFirstChar)) {
				ProcessHome();
				*pResult = TRUE; // prevent
			}
		}
		else if ((pMsgFilter->wParam == VK_DOWN) || (pMsgFilter->wParam == VK_UP))
		{
			BOOL bFirstChar = FALSE;
			if (IsLastLine(bFirstChar)) {
				ProcessNextCommand(pMsgFilter->wParam == VK_UP);
				*pResult = TRUE; // prevent
			}
		}
		else if ((pMsgFilter->wParam >= VK_PRIOR) && (pMsgFilter->wParam <= VK_DOWN))
		{
			*pResult = FALSE;
		}
		else 
		{
			// move to last position
			BOOL bFirstChar = FALSE;
			if (!IsLastLine(bFirstChar))
				m_wndRichEdit.SetSel(-1, -1);
			*pResult = FALSE;
		}
	}
}


// afx_msg
void CCommandWnd::OnContextMenu(CWnd* pWnd, CPoint point)
{
	if (pWnd->GetSafeHwnd() != m_wndRichEdit.GetSafeHwnd())
	{
		__super::OnContextMenu(pWnd, point);
		return;
	}
	m_wndRichEdit.SetFocus();
	CUITools::TrackPopupMenu(IDM_POPUP_MENU, IDM_POPUP_COMMAND_INDEX, this, point);
}

BOOL CCommandWnd::IsLastLine(BOOL& bFirstChar)
{
	bFirstChar = FALSE;
	int lineCount = m_wndRichEdit.GetLineCount();
	int iLine = m_wndRichEdit.LineFromChar(-1);
	if (iLine == (lineCount - 1)) {
		// not last line, prevent default
		int iIndex = m_wndRichEdit.LineIndex(iLine);
		CHARRANGE cr;
		m_wndRichEdit.GetSel(cr);
		bFirstChar = cr.cpMin == (iIndex + 1);
		return TRUE;
	}
	return FALSE;
}

void CCommandWnd::ProcessNextCommand(bool bUp)
{
	// last line here
	CString strCommand;
	if (m_cmdBuffer.IsEmpty())
		return;
	if (bUp)  {
		if (m_cmdBufferIndex == -1)
			m_cmdBufferIndex = m_cmdBuffer.GetUpperBound();
		else if (m_cmdBufferIndex > 0)
			m_cmdBufferIndex--;
	}
	else {
		if (m_cmdBufferIndex < m_cmdBuffer.GetUpperBound())
			m_cmdBufferIndex++;

	}
	strCommand = m_cmdBuffer.GetAt(m_cmdBufferIndex);
	if (strCommand.IsEmpty())
		return;
	strCommand = L">" + strCommand;
	m_bSkipEnProtect = true;
	m_wndRichEdit.LockWindowUpdate();
	int iLine = m_wndRichEdit.LineFromChar(-1);
	int iPos = m_wndRichEdit.LineIndex(iLine);
	m_wndRichEdit.SetSel(iPos, -1);
	m_wndRichEdit.ReplaceSel(strCommand);
	m_wndRichEdit.SetSel(-1, -1);
	m_wndRichEdit.UnlockWindowUpdate();
	m_bSkipEnProtect = false;
}

void CCommandWnd::ProcessHome()
{
	// set pos after first character
	int iLine = m_wndRichEdit.LineFromChar(-1);
	int iPos = m_wndRichEdit.LineIndex(iLine);
	m_wndRichEdit.SetSel(iPos + 1, iPos + 1);
}

void CCommandWnd::ProcessCurrentLine()
{
	/*
	m_wndRichEdit.LockWindowUpdate();
	int iLine = m_wndRichEdit.LineFromChar(-1);
	int nLen = m_wndRichEdit.LineLength(iLine);
	CString strText;
	LPWSTR buf = strText.GetBuffer(nLen + 64); // + 64 for dwLength
	int resultLen = m_wndRichEdit.GetLine(iLine, buf, nLen + 62); // two symbols for line length (Win32 API)
	strText.ReleaseBufferSetLength(resultLen);
	strText.Trim();
	int cmdLen = strText.GetLength();
	if ((cmdLen > 0) && (strText.GetAt(0) == L'>')) {
		strText = strText.Right(cmdLen - 1);
	}
	CheckCmdBufferSize();
	if (m_cmdBuffer.IsEmpty() || (m_cmdBuffer.GetAt(m_cmdBuffer.GetUpperBound()) != strText))
		m_cmdBuffer.Add(strText);
	m_cmdBufferIndex = -1;
	CString strResult = COMMAND_PROMPT;
	bool bOk = true;
	if (!strText.IsEmpty()) {
		try 
		{
			strResult = L"\r";
			strResult += JavaScriptRuntime::Evaluate(strText);
			strResult += COMMAND_PROMPT;
			bOk = true;
		}
		catch (JavaScriptException& ex) 
		{
			strResult = L"\r";
			strResult += ex.GetMessage();
			strResult += COMMAND_PROMPT;
			bOk = false;
		}
	}
	m_wndRichEdit.SetSel(-1, -1);
	m_wndRichEdit.ReplaceSel(strResult);
	
	int iResultLine = m_wndRichEdit.GetLineCount() - 2;
	if (iResultLine < 0) {
		m_wndRichEdit.UnlockWindowUpdate();
		return;
	}
	m_bSkipEnProtect = true;
	int nFirstChar = m_wndRichEdit.LineIndex(iResultLine);
	int nLineLen = strResult.GetLength() - 3; // \r....\r>
	m_wndRichEdit.SetSel(nFirstChar, nFirstChar + nLineLen);

	CHARFORMAT2W cf;
	memset(&cf, 0, sizeof(CHARFORMAT2W));
	cf.cbSize = sizeof(CHARFORMAT2W);
	cf.dwMask = CFM_COLOR;
	cf.crTextColor = bOk ? RGB(49, 122, 46) : RGB(142, 33, 11);
	m_wndRichEdit.SetSelectionCharFormat(cf);

	m_wndRichEdit.SetSel(-1, -1);
	m_wndRichEdit.EmptyUndoBuffer();
	cf.crTextColor = RGB(0, 0, 0);
	m_wndRichEdit.SetSelectionCharFormat(cf);

	m_bSkipEnProtect = false;
	m_wndRichEdit.UnlockWindowUpdate();
	AfxGetMainWnd()->PostMessageW(WM_COMMAND, ID_VIEW_COMMAND);
	*/
}

void CCommandWnd::CheckCmdBufferSize()
{
	if (!m_cmdBuffer.IsEmpty() && (m_cmdBuffer.GetSize() >= BUFFER_SIZE))
		m_cmdBuffer.RemoveAt(0);
}

// afx_msg
void CCommandWnd::OnEditCopy()
{
	m_wndRichEdit.Copy();
	AfxGetMainWnd()->PostMessageW(WM_COMMAND, ID_VIEW_COMMAND);
}

// afx_msg
void CCommandWnd::OnUpdateEditCopy(CCmdUI* pCmdUI)
{
	CHARRANGE cr;
	m_wndRichEdit.GetSel(cr);
	pCmdUI->Enable(cr.cpMin != cr.cpMax);
}

// afx_msg
void CCommandWnd::OnEditCut()
{
	BOOL bFirstChar = FALSE;
	BOOL bLastLine = IsLastLine(bFirstChar);
	if (!bLastLine) {
		return;
	}
	m_bSkipEnProtect = true;
	m_wndRichEdit.Cut();
	m_bSkipEnProtect = false;
	AfxGetMainWnd()->PostMessageW(WM_COMMAND, ID_VIEW_COMMAND);
}

// afx_msg
void CCommandWnd::OnUpdateEditCut(CCmdUI* pCmdUI)
{
	BOOL bFirstChar = FALSE;
	BOOL bLastLine = IsLastLine(bFirstChar);
	if (!bLastLine) {
		pCmdUI->Enable(FALSE);
		return;
	}
	CHARRANGE cr;
	m_wndRichEdit.GetSel(cr);
	pCmdUI->Enable(cr.cpMin != cr.cpMax);
}

// afx_msg 
void CCommandWnd::OnEditPaste()
{
	BOOL bFirstChar = FALSE;
	BOOL bLastLine = IsLastLine(bFirstChar);
	if (!bLastLine) {
		return;
	}
	m_bSkipEnProtect = true;
	m_wndRichEdit.SetSel(-1, 1);

	{ // LowLevel API - avoid language problems
		if (::IsClipboardFormatAvailable(CF_UNICODETEXT)) {
			if (OpenClipboard()) {
				HGLOBAL hGlobal = ::GetClipboardData(CF_UNICODETEXT);
				if (hGlobal != NULL) {
					LPCWSTR szText = (LPCWSTR) ::GlobalLock(hGlobal);
					if (szText != NULL) {
						m_wndRichEdit.ReplaceSel(szText, TRUE);
						::GlobalUnlock(hGlobal);
					}
				}
				::CloseClipboard();
			}
		}
	}
	m_bSkipEnProtect = false;
	m_wndRichEdit.SetSel(-1, 1);
	AfxGetMainWnd()->PostMessageW(WM_COMMAND, ID_VIEW_COMMAND);
}

// afx_msg 
void CCommandWnd::OnUpdateEditPaste(CCmdUI* pCmdUI)
{
	pCmdUI->Enable(m_wndRichEdit.CanPaste(CF_UNICODETEXT) || m_wndRichEdit.CanPaste(CF_TEXT));
}
// afx_msg 
void CCommandWnd::OnEditClearAll()
{
	m_cmdBuffer.RemoveAll();
	m_cmdBufferIndex = -1;
	m_bSkipEnProtect = true;
	m_wndRichEdit.LockWindowUpdate();
	m_wndRichEdit.SetSel(0, -1);
	m_wndRichEdit.ReplaceSel(L">");
	m_wndRichEdit.SetSel(1, 1);
	m_wndRichEdit.UnlockWindowUpdate();
	m_bSkipEnProtect = false;
}

// afx_msg 
void CCommandWnd::OnEditUndo()
{
	m_bSkipEnProtect = true;
	m_wndRichEdit.Undo();
	m_bSkipEnProtect = false;
}

// afx_msg 
void CCommandWnd::OnUpdateEditUndo(CCmdUI* pCmdUI)
{
	pCmdUI->Enable(m_wndRichEdit.CanUndo());
}

// afx_msg 
void CCommandWnd::OnEditRedo()
{
	m_bSkipEnProtect = true;
	m_wndRichEdit.Redo();
	m_bSkipEnProtect = false;
}

// afx_msg 
void CCommandWnd::OnUpdateEditRedo(CCmdUI* pCmdUI)
{
	pCmdUI->Enable(m_wndRichEdit.CanRedo());
}
