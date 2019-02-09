// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.


#include "stdafx.h"

#include "navtabs.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#define MAX_TAB_WIDTH 220
#define MIN_TAB_WIDTH 40

#define BG_BRUSH_NORMAL RGB(0xf2, 0xf3, 0xf9)
#define BG_BRUSH_LIGHT RGB(0xde, 0xe2, 0xed)

#define BRD_PEN_NORMAL RGB(0xaf, 0xaf, 0xaf)

#define BRD_GAP 4
#define TEXT_GAP 12
#define CLOSE_BTN_SIZE 16

bool CNavTab::SetText(const wchar_t* szCaption) 
{ 
	if (m_caption == szCaption)
		return false;
	m_caption = szCaption; 
	return true;
}

// virtual
void CNavTab::Draw(CDC* pDC)
{
	COLORREF bkColor = UNKNOWN_COLOR;
	
	if (m_bActive)
		bkColor = BG_BRUSH_NORMAL;
	else if (m_bHighlighted)
		bkColor = BG_BRUSH_LIGHT;

	pDC->MoveTo(m_rect.right - 1, m_rect.top + BRD_GAP);
	pDC->LineTo(m_rect.right - 1, m_rect.bottom - BRD_GAP);

	if (bkColor != UNKNOWN_COLOR) {
		CBrushSDC bkBrush(pDC, bkColor);
		pDC->FillRect(m_rect, &bkBrush);
	}
	CRect tabRect(m_rect);
	tabRect.DeflateRect(TEXT_GAP, 0);
	tabRect.right -= CLOSE_BTN_SIZE;
	pDC->DrawText(m_caption, &tabRect, DT_SINGLELINE | DT_LEFT | DT_VCENTER | DT_END_ELLIPSIS);

	CRect cbRect(m_closeBtnRect);
	cbRect.DeflateRect(3, 3);
	//pDC->Draw3dRect(m_closeBtnRect, RGB(255, 0, 0), RGB(255, 0, 0));

	pDC->MoveTo(cbRect.left, cbRect.top);
	pDC->LineTo(cbRect.right, cbRect.bottom);
	pDC->MoveTo(cbRect.right-1, cbRect.top);
	pDC->LineTo(cbRect.left-1, cbRect.bottom);
}

// virtual 
void CNavTab::ExecuteCommand(CWnd* pWnd, CPoint point)
{
	if (m_closeBtnRect.PtInRect(point))
		pWnd->PostMessage(WMI_CEF_TAB_COMMAND, WMI_CEF_TAB_COMMAND_CLOSE, reinterpret_cast<LPARAM>(GetHwnd()));
	else
		pWnd->PostMessage(WMI_CEF_TAB_COMMAND, WMI_CEF_TAB_COMMAND_SELECT, reinterpret_cast<LPARAM>(GetHwnd()));
}

// virtual 
void CNavTab::SetRect(const CRect rect)
{
	__super::SetRect(rect);
	m_closeBtnRect = m_rect;
	m_closeBtnRect.left = m_closeBtnRect.right - CLOSE_BTN_SIZE;
	m_closeBtnRect.bottom = m_closeBtnRect.top + CLOSE_BTN_SIZE;
	int yOffset = (m_rect.Height() - m_closeBtnRect.Height()) / 2;
	m_closeBtnRect.OffsetRect(-CLOSE_BTN_SIZE / 2, yOffset);
}

// ======================
//virtual 
CNavTabs::~CNavTabs()
{
	for (int i = 0; i < m_tabs.GetSize(); i++) {
		delete m_tabs[i];
	}
	m_tabs.RemoveAll();
}

// virtual 
void CNavTabs::Draw(CDC* pDC)
{
	CFont* pOldFont = pDC->SelectObject(CTheme::GetUIFont(CTheme::FontNonClient));
	CPenSDC  tabPen(pDC, BRD_PEN_NORMAL);
	__super::Draw(pDC);
	pDC->SelectObject(pOldFont);
}

void CNavTabs::RecalcLayout(CRect clientRect, BOOL bZoomed)
{
	int tabHeight = clientRect.Height();
	int tabCount = GetButtonsCount();
	if (!tabCount) return;
	int tabWidth = clientRect.Width() / tabCount;
	if (tabWidth > MAX_TAB_WIDTH)
		tabWidth = MAX_TAB_WIDTH;
	CRect tabRect(clientRect);
	tabRect.right = tabRect.left + tabWidth;
	for (int i = 0; i < tabCount; i++) {
		auto pBtn = GetButton(i);
		pBtn->SetRect(tabRect);
		tabRect.OffsetRect(tabWidth - 1, 0);
	}
	m_nWidth = tabWidth * tabCount;
	m_rect = clientRect;
	// 1px overlap
	m_rect.right = m_rect.left + m_nWidth - tabCount + 1;
}

void CNavTabs::AddTab(const wchar_t* szCaption, HWND hWnd, UINT nId)
{
	auto pTab = new CNavTab();
	pTab->SetText(szCaption);
	pTab->SetHwnd(hWnd);
	pTab->SetID(nId);
	m_tabs.Add(pTab);
	SetActiveTab(pTab);
}

CNavTab* CNavTabs::GetTab(int index)
{
	ATLASSERT(index >= 0 && index < m_tabs.GetCount());
	return m_tabs[index];
}

CNavTab* CNavTabs::FindTab(HWND hWnd)
{
	for (int i = 0; i < m_tabs.GetSize(); i++) {
		CNavTab* pTab = m_tabs.GetAt(i);
		if (pTab->GetHwnd() == hWnd)
			return pTab;
	}
	return nullptr;
}

void CNavTabs::SetActiveTab(CNavTab* pActiveTab)
{
	for (int i = 0; i < m_tabs.GetSize(); i++) {
		CNavTab* pTab = m_tabs.GetAt(i);
		pTab->SetActive(pTab == pActiveTab);
	}
}

bool CNavTabs::RemoveTab(CNavTab* pTabToRemove, CWnd* pWnd) 
{
	if (m_tabs.GetSize() <= 1)
		return false;
	int iIndex = -1;
	for (int i = 0; i < m_tabs.GetSize(); i++) {
		CNavTab* pTab = m_tabs.GetAt(i);
		if (pTab == pTabToRemove) {
			iIndex = i;
			break;
		}
	}
	if (iIndex == -1)
		return false;
	int newIndex = iIndex - 1;
	if (newIndex < 0)
		newIndex = m_tabs.GetCount() - 1;

	CNavTab* pTab = m_tabs.GetAt(newIndex);
	// SEND required
	pWnd->SendMessage(WMI_CEF_TAB_COMMAND, WMI_CEF_TAB_COMMAND_SELECT, reinterpret_cast<LPARAM>(pTab->GetHwnd()));

	delete pTabToRemove;
	m_tabs.RemoveAt(iIndex);
	return true;
}


