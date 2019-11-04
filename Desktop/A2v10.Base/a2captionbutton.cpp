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

bool CCaptionButtonsBase::ClearHighlight()
{
	bool bRet = false;
	for (int i = 0; i < GetButtonsCount(); i++) {
		CCaptionButton* pBtn = GetButton(i);
		bRet = bRet | pBtn->SetHighlight(false);
	}
	return bRet;
}

void CCaptionButtonsBase::Draw(CDC* pDC)
{
	for (int i = 0; i < GetButtonsCount(); i++) {
		GetButton(i)->Draw(pDC);
	}
}

bool CCaptionButtonsBase::MouseMove(CPoint point)
{
	bool bRet = false;
	for (int i = 0; i < GetButtonsCount(); i++) {
		CCaptionButton* pBtn = GetButton(i);
		bRet = bRet | pBtn->SetHighlight(pBtn->GetRect().PtInRect(point) ? true : false);
	}
	return bRet;
}

bool CCaptionButtonsBase::PressButton(CPoint point, CWnd* pWnd)
{
	for (int i = 0; i < GetButtonsCount(); i++) {
		CCaptionButton* pBtn = GetButton(i);
		if (pBtn->GetRect().PtInRect(point))
		{
			if (pBtn->TrackButton(pWnd, point)) {
				pBtn->ExecuteCommand(pWnd, point);
			}
			return true;
		}
	}
	return false;
}


CCaptionButtons::CCaptionButtons(UINT nReplaceHelp /*= 0*/)
{
	m_buttons[0].SetID(nReplaceHelp ? nReplaceHelp : IDMENU_HELP);
	m_buttons[1].SetID(IDMENU_MINIMIZE);
	m_buttons[2].SetID(IDMENU_MAXIMIZE);
	m_buttons[3].SetID(IDMENU_CLOSE);
}

CCaptionNavigateButtons::CCaptionNavigateButtons()
{
	m_buttons[0].SetID(IDMENU_BACK);
	m_buttons[1].SetID(IDMENU_FORWARD);
	m_buttons[2].SetID(IDMENU_RELOAD);
	m_buttons[0].SetDisabled(true);
	m_buttons[1].SetDisabled(true);
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
		btnRect.OffsetRect(btnSize, 0);
	}
	m_nWidth = btnSize * btnsCount;
	m_rect = clientRect;
	m_rect.right = m_rect.left + m_nWidth;
}

bool CCaptionNavigateButtons::DisableButton(int index, bool bDisable)
{
	if (index >= 0 && index < _countof(m_buttons))
	{
		return m_buttons[index].SetDisabled(bDisable);
	}
	return false;
}


void CCaptionButton::ExecuteCommand(CWnd* pWnd, CPoint point)
{
	switch (m_nID) {
	case IDMENU_CLOSE:
		pWnd->PostMessageW(WM_SYSCOMMAND, SC_CLOSE);
		break;
	case IDMENU_MINIMIZE:
		pWnd->PostMessageW(WM_SYSCOMMAND, SC_MINIMIZE);
		break;
	case IDMENU_MAXIMIZE:
		pWnd->PostMessageW(WM_SYSCOMMAND, SC_MAXIMIZE);
		break;
	case IDMENU_RESTORE:
		pWnd->PostMessageW(WM_SYSCOMMAND, SC_RESTORE);
		break;
	case IDMENU_HELP:
		pWnd->PostMessageW(WM_COMMAND, ID_APP_ABOUT);
		break;
	case IDMENU_BACK:
		pWnd->PostMessageW(WM_COMMAND, ID_NAVIGATE_BACK);
		break;
	case IDMENU_FORWARD:
		pWnd->PostMessageW(WM_COMMAND, ID_NAVIGATE_FORWARD);
		break;
	case IDMENU_RELOAD:
		pWnd->PostMessageW(WM_COMMAND, ID_NAVIGATE_REFRESH);
		break;
	case IDMENU_TOOLS:
		pWnd->PostMessageW(WM_COMMAND, ID_APP_TOOLS);
		break;
	}
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

bool CCaptionButton::SetPress(bool bSet)
{
	if (m_bDisabled)
		bSet = false;
	if (m_bPressed == bSet)
		return false;
	m_bPressed = bSet;
	return true;
}

// virtual 
void CCaptionButton::SetRect(const CRect rect) { 
	m_rect = rect; 
}

bool CCaptionButton::SetState(bool bHighlight, bool bPressed)
{
	if (m_bDisabled) {
		bHighlight = false;
		bPressed = false;
	}
	if ((m_bHighlighted == bHighlight) && (m_bPressed == bPressed))
		return false;
	m_bHighlighted = bHighlight;
	m_bPressed = bPressed;
	return false;
}

bool CCaptionButton::SetHighlight(bool bSet)
{
	if (m_bDisabled)
		bSet = false;
	if (m_bHighlighted == bSet)
		return false;
	m_bHighlighted = bSet;
	return true;
}

bool CCaptionButton::SetDisabled(bool bSet)
{
	if (m_bDisabled == bSet)
		return false;
	m_bDisabled = bSet;
	return true;
}

void CCaptionButton::Draw(CDC* pDC)
{
	CA2VisualManager* pVM = DYNAMIC_DOWNCAST(CA2VisualManager, CMFCVisualManager::GetInstance());
	if (!pVM)
		return;
	pVM->OnDrawA2CaptionButton(pDC, m_rect, m_nID, m_bHighlighted, m_bPressed, m_bDisabled);
}
