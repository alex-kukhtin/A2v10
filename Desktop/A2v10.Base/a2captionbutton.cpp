// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.


#include "stdafx.h"
#include "..\include\a2visualmanager.h"
#include "..\include\a2captionbutton.h"
#include "..\include\allresources.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

CCaptionButtonsBase::CCaptionButtonsBase()
	: m_nWidth(0), m_rect(0, 0, 0, 0)
{
}

BOOL CCaptionButtonsBase::ClearHighlight()
{
	BOOL bRet = FALSE;
	for (int i = 0; i < GetButtonsCount(); i++) {
		CCaptionButton* pBtn = GetButton(i);
		bRet = bRet | pBtn->SetHighlight(FALSE);
	}
	return bRet;
}

void CCaptionButtonsBase::Draw(CDC* pDC)
{
	for (int i = 0; i < GetButtonsCount(); i++) {
		GetButton(i)->Draw(pDC);
	}
}

BOOL CCaptionButtonsBase::MouseMove(CPoint point)
{
	BOOL bRet = FALSE;
	for (int i = 0; i < GetButtonsCount(); i++) {
		CCaptionButton* pBtn = GetButton(i);
		bRet = bRet | pBtn->SetHighlight(pBtn->GetRect().PtInRect(point) ? TRUE : FALSE);
	}
	return bRet;
}

BOOL CCaptionButtonsBase::PressButton(CPoint point, CWnd* pWnd)
{
	for (int i = 0; i < GetButtonsCount(); i++) {
		CCaptionButton* pBtn = GetButton(i);
		if (pBtn->GetRect().PtInRect(point))
		{
			if (pBtn->TrackButton(pWnd, point)) {
				pBtn->ExecuteCommand(pWnd);
			}
		}
	}
	return TRUE;
}


CCaptionButtons::CCaptionButtons()
{
	m_buttons[0].SetID(IDMENU_HELP);
	m_buttons[1].SetID(IDMENU_MINIMIZE);
	m_buttons[2].SetID(IDMENU_MAXIMIZE);
	m_buttons[3].SetID(IDMENU_CLOSE);
}

CCaptionNavigateButtons::CCaptionNavigateButtons()
{
	m_buttons[0].SetID(IDMENU_BACK);
	m_buttons[1].SetID(IDMENU_FORWARD);
	m_buttons[2].SetID(IDMENU_RELOAD);
}

void CCaptionButtons::RecalcLayout(CRect clientRect, BOOL bZoomed)
{
	int btnSize = clientRect.Height();
	int btnsCount = GetButtonsCount();
	CRect btnRect(clientRect);
	btnRect.left = btnRect.right - btnSize;
	for (int i = btnsCount - 1; i >= 0; i--) {
		auto pBtn = GetButton(i);
		pBtn->SetRect(btnRect);
		btnRect.OffsetRect(-btnSize, 0);
	}
	m_nWidth = btnSize * btnsCount;
	m_rect = clientRect;
	m_rect.left = m_rect.right - m_nWidth;
	m_buttons[2].SetID(bZoomed ? IDMENU_RESTORE : IDMENU_MAXIMIZE);
}

void CCaptionNavigateButtons::RecalcLayout(CRect clientRect, BOOL bZoomed)
{
	int btnSize = clientRect.Height();
	int btnsCount = GetButtonsCount();
	CRect btnRect(clientRect);
	btnRect.right = btnRect.left + btnSize;
	for (int i = 0; i < btnsCount; i++) {
		auto pBtn = GetButton(i);
		pBtn->SetRect(btnRect);
		auto nId = pBtn->GetID();
		btnRect.OffsetRect(btnSize, 0);
	}
	m_nWidth = btnSize * btnsCount;
	m_rect = clientRect;
	m_rect.right = m_rect.left + m_nWidth;
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
	else if (m_nID == IDMENU_BACK)
		pWnd->PostMessageW(WM_COMMAND, ID_NAVIGATE_BACK);
	else if (m_nID == IDMENU_FORWARD)
		pWnd->PostMessageW(WM_COMMAND, ID_NAVIGATE_FORWARD);
	else if (m_nID == IDMENU_RELOAD)
		pWnd->PostMessageW(WM_COMMAND, ID_NAVIGATE_REFRESH);
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
