

#include "stdafx.h"
#include "..\include\a2visualmanager.h"
#include "..\include\a2captionbutton.h"
#include "..\include\allresources.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

CCaptionButtons::CCaptionButtons()
	: m_nWidth(0), m_rect(0, 0, 0, 0)
{
	m_buttons[0].SetID(IDMENU_HELP);
	m_buttons[1].SetID(IDMENU_MINIMIZE);
	m_buttons[2].SetID(IDMENU_MAXIMIZE);
	m_buttons[3].SetID(IDMENU_CLOSE);
}

void CCaptionButtons::RecalcLayout(CRect clientRect, BOOL bZoomed)
{
	int btnSize = clientRect.Height();
	int btnsCount = _countof(m_buttons);
	CRect btnRect(clientRect);
	btnRect.left = btnRect.right - btnSize;
	for (int i = btnsCount - 1; i >= 0; i--) {
		m_buttons[i].SetRect(btnRect);
		btnRect.OffsetRect(-btnSize, 0);
	}
	m_buttons[2].SetID(bZoomed ? IDMENU_RESTORE : IDMENU_MAXIMIZE);
	m_nWidth = btnSize * btnsCount;
	m_rect = clientRect;
	m_rect.left = m_rect.right - m_nWidth;
}

void CCaptionButtons::Draw(CDC* pDC)
{
	for (int i = 0; i < _countof(m_buttons); i++) {
		m_buttons[i].Draw(pDC);
	}
}

BOOL CCaptionButtons::ClearHighlight()
{
	BOOL bRet = FALSE;
	for (int i = 0; i < _countof(m_buttons); i++) {
		CCaptionButton& btn = m_buttons[i];
		bRet = bRet | btn.SetHighlight(FALSE);
	}
	return bRet;
}

BOOL CCaptionButtons::MouseMove(CPoint point)
{
	BOOL bRet = FALSE;
	for (int i = 0; i < _countof(m_buttons); i++) {
		CCaptionButton& btn = m_buttons[i];
		bRet = bRet | btn.SetHighlight(btn.GetRect().PtInRect(point) ? TRUE : FALSE);
	}
	return bRet;
}


void CCaptionButton::ExecuteCommand(CWnd* pWnd)
{
	if (m_nID == IDMENU_CLOSE)
		pWnd->PostMessageW(WM_SYSCOMMAND, SC_CLOSE);
	else if (m_nID == IDMENU_MINIMIZE)
		pWnd->PostMessageW(WM_SYSCOMMAND, SC_MINIMIZE);
	else if (m_nID == IDMENU_MAXIMIZE)
		pWnd->PostMessageW(WM_SYSCOMMAND, SC_MAXIMIZE);
	else if (m_nID == IDMENU_RESTORE)
		pWnd->PostMessageW(WM_SYSCOMMAND, SC_RESTORE);
	else if (m_nID == IDMENU_HELP)
		pWnd->PostMessageW(WM_COMMAND, ID_APP_ABOUT);
}

bool CCaptionButton::TrackButton(CWnd* pWnd, CPoint point)
{
	// don't handle if capture already set
	if (::GetCapture() != NULL)
		return false;
	if (pWnd == NULL)
		return false;
	// set capture to the window which received this message
	SetState(true, true);
	pWnd->InvalidateRect(m_rect);
	pWnd->RedrawWindow();
	pWnd->SetCapture();
	ATLASSERT(pWnd == CWnd::GetCapture());
	bool bContinue = true;
	bool bCommand = false;
	// get messages until capture lost or cancelled/accepted
	while (bContinue && (CWnd::GetCapture() == pWnd)) {
		MSG msg;
		if (!::GetMessage(&msg, NULL, 0, 0)) {
			AfxPostQuitMessage((int)msg.wParam);
			bContinue = false;
			break;
		}
		switch (msg.message) {
		case WM_LBUTTONUP:
		case WM_NCLBUTTONUP:
		{
			CPoint pt(msg.lParam);
			SetState(false, false);
			if (m_rect.PtInRect(pt)) {
				// execute command here
				bCommand = true;
			}
			bContinue = false;
		}
		break;
		case WM_NCMOUSEMOVE:
		case WM_MOUSEMOVE:
		{
			CPoint pt(msg.lParam);
			if (m_rect.PtInRect(pt)) {
				if (SetState(true, true))
					pWnd->InvalidateRect(m_rect);
			}
			else
			{
				if (SetState(true, false))
					pWnd->InvalidateRect(m_rect);
			}
		}
		break;
		default:
			DispatchMessage(&msg);
			break;
		}
	}
	pWnd->InvalidateRect(m_rect);
	ReleaseCapture();
	return bCommand;
}

BOOL CCaptionButtons::PressButton(CPoint point, CWnd* pWnd)
{
	for (int i = 0; i < _countof(m_buttons); i++) {
		CCaptionButton& btn = m_buttons[i];
		if (btn.GetRect().PtInRect(point))
		{
			if (btn.TrackButton(pWnd, point)) {
				btn.ExecuteCommand(pWnd);
			}
		}
	}
	return TRUE;
}

BOOL CCaptionButton::SetPress(bool bSet)
{
	if (m_bPressed == bSet)
		return FALSE;
	m_bPressed = bSet;
	return TRUE;
}

BOOL CCaptionButton::SetState(bool bHighlight, bool bPressed)
{
	if ((m_bHighlighted == bHighlight) && (m_bPressed == bPressed))
		return FALSE;
	m_bHighlighted = bHighlight,
		m_bPressed = bPressed;
	return TRUE;
}

BOOL CCaptionButton::SetHighlight(bool bSet)
{
	if (m_bHighlighted == bSet)
		return FALSE;
	m_bHighlighted = bSet;
	return TRUE;
}

void CCaptionButton::Draw(CDC* pDC)
{
	CA2VisualManager* pVM = DYNAMIC_DOWNCAST(CA2VisualManager, CMFCVisualManager::GetInstance());
	if (!pVM)
		return;
	pVM->OnDrawA2CaptionButton(pDC, m_rect, m_nID, m_bHighlighted, m_bPressed);
}
