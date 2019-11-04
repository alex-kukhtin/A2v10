// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "..\Include\a2visualmanager.h"
#include "..\Include\a2borderpane.h"
#include "..\Include\a2tabview.h"
#include "..\Include\a2dockablepane.h"
#include "..\Include\a2toolbars.h"
#include "..\Include\a2toolbox.h"
#include "..\Include\appdefs.h"
#include "..\Include\guiext.h"
#include "..\Include\theme.h"
#include "..\Include\appdefs.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#define COLOR_BLACK RGB(0, 0, 0)
#define COLOR_WHITE RGB(255, 255, 255)
#define AUTO_HIDE_BUTTONS_GAP 12

IMPLEMENT_DYNCREATE(CA2VisualManager, CMFCVisualManagerVS2005)


class CA2AutoHideButton : public CMFCAutoHideButton
{
	DECLARE_DYNCREATE(CA2AutoHideButton)
protected:
	virtual void OnDraw(CDC* pDC);
};

IMPLEMENT_DYNCREATE(CA2AutoHideButton, CMFCAutoHideButton)

// virtual 
void CA2AutoHideButton::OnDraw(CDC* pDC)
{
	ASSERT_VALID(this);

	CSize size = GetSize();
	m_rect.SetRect(0, 0, size.cx, size.cy);

	// calculate border size and draw the border
	CRect rectBorderSize(m_nBorderSize, 0, m_nBorderSize, m_nBorderSize);

	switch (m_dwAlignment & CBRS_ALIGN_ANY)
	{
	case CBRS_ALIGN_RIGHT:
		afxGlobalUtils.FlipRect(rectBorderSize, 90);
		break;
	case CBRS_ALIGN_BOTTOM:
		afxGlobalUtils.FlipRect(rectBorderSize, 180);
		break;
	case CBRS_ALIGN_LEFT:
		afxGlobalUtils.FlipRect(rectBorderSize, -90);
		break;
	}

	OnFillBackground(pDC, m_rect);
	OnDrawBorder(pDC, m_rect, rectBorderSize);

	if (m_pAutoHideWindow == NULL)
		return;

	ASSERT_VALID(m_pAutoHideWindow);

	CRect rectDraw = m_rect;

	switch (m_dwAlignment & CBRS_ALIGN_ANY)
	{
	case CBRS_ALIGN_RIGHT:
		rectDraw.bottom -= AUTO_HIDE_BUTTONS_GAP;
		rectDraw.right -= 3;
		break;
	case CBRS_ALIGN_LEFT:
		rectDraw.bottom -= AUTO_HIDE_BUTTONS_GAP;
		rectDraw.left += 3;
		break;
	case CBRS_ALIGN_BOTTOM:
		rectDraw.right -= AUTO_HIDE_BUTTONS_GAP;
		rectDraw.bottom -= 3;
		break;
	case CBRS_ALIGN_TOP:
		rectDraw.right -= AUTO_HIDE_BUTTONS_GAP;
		rectDraw.top += 3;
		break;
	}

	// Draw text:
	CString strText;
	m_pAutoHideWindow->GetWindowText(strText);

	if (!strText.IsEmpty())
	{
		int nOldMode = pDC->SetBkMode(TRANSPARENT);

		CFont* pFontOld = (CFont*)pDC->SelectObject(IsHorizontal() ? &(GetGlobalData()->fontRegular) : &(GetGlobalData()->fontVert));
		ENSURE(pFontOld != NULL);

		pDC->SetTextColor(CMFCVisualManager::GetInstance()->GetAutoHideButtonTextColor(this));

		if (IsHorizontal())
		{
			pDC->DrawText(strText, &rectDraw, DT_SINGLELINE | DT_VCENTER | DT_CENTER);
		}
		else
		{
			TEXTMETRIC tm;
			pDC->GetTextMetrics(&tm);

			CRect rectText = rectDraw;

			rectText.left = rectText.right - (rectDraw.Width() - tm.tmHeight + 1) / 2;
			rectText.top += tm.tmAveCharWidth;
			rectText.bottom = rectDraw.top + rectDraw.Height() / 2;

			pDC->DrawText(strText, &rectText, DT_SINGLELINE | DT_VCENTER | DT_NOCLIP);
		}

		pDC->SelectObject(pFontOld);
		pDC->SetBkMode(nOldMode);
	}
}

CA2VisualManager::CA2VisualManager()
	:m_bDebugMode(false)
{
	CMFCAutoHideButton::m_nBorderSize = 1;
	CMFCAutoHideBar::m_pAutoHideButtonRTS = RUNTIME_CLASS(CA2AutoHideButton);
	COLORREF defColor = UNKNOWN_COLOR;
	m_clrMenuSideBar = defColor;
	m_clrToolBar = defColor;
	m_clrDivider = defColor;
	m_clrStatusBar = defColor;
	m_clrStatusBarDebugMode = defColor;
	m_clrCaptionButtonBackground = defColor;
	m_clrActiveCaption = defColor;
	m_clrInactiveCaption = defColor;
	m_clrWindowCaption = defColor;
	m_clrDockedPaneBorder = defColor;
	m_clrTabArea = defColor;
	m_clrHotTab = defColor;
	m_clrMainClientArea = defColor;
	m_clrTabViewArea = defColor;
	m_clrTabViewBorder = defColor;

	m_clrHeaderBack = defColor;
	m_clrHeaderBorder = defColor;
}


CA2VisualManager::~CA2VisualManager()
{
}

bool CA2VisualManager::SetDebugMode(bool bMode)
{
	if (m_bDebugMode == bMode)
		return false;
	m_bDebugMode = bMode;
	return true;
}

// virtual 
void CA2VisualManager::OnUpdateSystemColors()
{

	m_clrSeparator = RGB(190, 195, 203); // separator

	m_clrMenuLight = RGB(234, 240, 255); // poupup menu background
	m_clrMenuBorder = RGB(155, 167, 183); // popup menu border
	m_clrMenuSideBar = RGB(242, 244, 254); // popup menu sidebar

	m_clrWindowCaption = RGB(214, 219, 233); // menu bar background
	m_clrToolBar = RGB(207, 214, 229); // toolbar background
	m_clrToolBarBottomLine = RGB(220, 224, 236); // toolbar border
	m_clrDivider = RGB(41, 57, 85); // divider
	m_clrStatusBar = RGB(14, 99, 156); // dark blue status bar
	m_clrStatusBarDebugMode = RGB(201, 81, 0); // brown status bar (debug)
	m_clrCaptionButtonBackground = RGB(255, 252, 244); // caption button background

	m_clrHighlight = RGB(253, 244, 191); // highlight button and menu
	m_clrHighlightDn = RGB(255, 242, 157); // pressed button
	m_clrHighlightChecked = RGB(233, 236, 238); // checked menu image

	m_clrMenuItemBorder = RGB(229, 195, 101); // button border
	m_clrActiveCaption = RGB(255, 242, 157); // active pane caption
	m_clrInactiveCaption = RGB(77, 96, 130);  // inactive pane caption 
	m_clrDockedPaneBorder = RGB(142, 155, 188); // pane border
	m_clrTabArea = RGB(42, 58, 87); // tab area
	m_clrHotTab = RGB(91, 113, 153); // hot tab
	m_clrMainClientArea = RGB(51, 70, 102); // mdi client area
	m_clrTabViewArea = RGB(230, 231, 232);
	m_clrTabViewBorder = RGB(204, 204, 204);

	m_clrHeaderBack = RGB(246, 246, 246);
	m_clrHeaderBorder = RGB(204, 206, 219);

	m_penSeparator.DeleteObject();
	m_brMenuLight.DeleteObject();
	m_brMenuSideBar.DeleteObject();
	m_brToolBar.DeleteObject();
	m_brFloatToolBarBorder.DeleteObject();
	m_brWindowCaption.DeleteObject();
	m_brDivider.DeleteObject();
	m_brStatusBar.DeleteObject();
	m_brStatusBarDebugMode.DeleteObject();
	m_brActiveCaption.DeleteObject();
	m_brInactiveCaption.DeleteObject();
	m_brDockedPaneBorder.DeleteObject();
	m_brTabArea.DeleteObject();
	m_brHotTab.DeleteObject();
	m_brMainClientArea.DeleteObject();
	m_brTabViewArea.DeleteObject();
	m_brTabViewBorder.DeleteObject();
	m_brHeaderBack.DeleteObject();

	m_brHighlight.DeleteObject();
	m_brHighlightDn.DeleteObject();
	m_brHighlightChecked.DeleteObject();

	m_penSeparator.CreatePen(PS_SOLID, 1, m_clrSeparator);
	m_brMenuLight.CreateSolidBrush(m_clrMenuLight);
	m_brMenuSideBar.CreateSolidBrush(m_clrMenuSideBar);
	m_brToolBar.CreateSolidBrush(m_clrToolBar);
	m_brFloatToolBarBorder.CreateSolidBrush(m_clrToolBarBottomLine);
	m_brWindowCaption.CreateSolidBrush(m_clrWindowCaption);
	m_brDivider.CreateSolidBrush(m_clrDivider);
	m_brStatusBar.CreateSolidBrush(m_clrStatusBar);
	m_brStatusBarDebugMode.CreateSolidBrush(m_clrStatusBarDebugMode);
	m_brActiveCaption.CreateSolidBrush(m_clrActiveCaption);
	m_brInactiveCaption.CreateSolidBrush(m_clrInactiveCaption);
	m_brDockedPaneBorder.CreateSolidBrush(m_clrDockedPaneBorder);
	m_brTabArea.CreateSolidBrush(m_clrTabArea);
	m_brHotTab.CreateSolidBrush(m_clrHotTab);
	m_brMainClientArea.CreateSolidBrush(m_clrMainClientArea);
	m_brTabViewArea.CreateSolidBrush(m_clrTabViewArea);
	m_brTabViewBorder.CreateSolidBrush(m_clrTabViewBorder);

	m_brHighlight.CreateSolidBrush(m_clrHighlight);
	m_brHighlightDn.CreateSolidBrush(m_clrHighlightDn);
	m_brHighlightChecked.CreateSolidBrush(m_clrHighlightChecked);

	m_brHeaderBack.CreateSolidBrush(m_clrHeaderBack);

	// TEST
	m_brMenuItemCheckedHighlight.DeleteObject();
	m_brMenuItemCheckedHighlight.CreateSolidBrush(RGB(255, 0, 255)/*clrMenuItemCheckedHighlight*/);
}

// virtual 
void CA2VisualManager::OnDrawPaneDivider(CDC* pDC, CPaneDivider* pSlider, CRect rect, BOOL bAutoHideMode)
{
	ASSERT_VALID(pDC);
	ASSERT_VALID(pSlider);

	if (!bAutoHideMode) {
		__super::OnDrawPaneDivider(pDC, pSlider, rect, bAutoHideMode);
		return;
	}
	CRect rectScreen = GetGlobalData()->m_rectVirtual;
	pSlider->ScreenToClient(&rectScreen);

	CRect rectFill = rect;
	rectFill.left = min(rectFill.left, rectScreen.left);

	OnFillBarBackground(pDC, pSlider, rectFill, rect);
	// do not draw around border
}

// virtual 
void CA2VisualManager::OnDrawPaneBorder(CDC* pDC, CBasePane* pBar, CRect& rect)
{
	if (pBar->IsKindOf(RUNTIME_CLASS(CMFCMenuBar)))
	{
		// do nothing
	}
	else if (pBar->IsKindOf(RUNTIME_CLASS(CMFCToolBar)))
	{
		CBrush* pOld = pDC->SelectObject(&m_brFloatToolBarBorder);
		pDC->PatBlt(rect.left, rect.top, rect.Width(), 1, PATCOPY);
		pDC->PatBlt(rect.left, rect.bottom - 1, rect.Width(), 1, PATCOPY);
		pDC->SelectObject(pOld);
		rect.top++;
		rect.bottom--;
		return;
	}
	__super::OnDrawPaneBorder(pDC, pBar, rect);
}

void CA2VisualManager::OnFillBarBackground(CDC* pDC, CBasePane* pBar, CRect rectClient, CRect rectClip, BOOL bNCArea /*=FALSE*/)
{
	if (pBar->IsKindOf(RUNTIME_CLASS(CMFCPopupMenuBar)))
	{
		pDC->FillRect(rectClip, &m_brMenuLight);

		CMFCPopupMenuBar* pMenuBar = DYNAMIC_DOWNCAST(CMFCPopupMenuBar, pBar);
		if (!pMenuBar->m_bDisableSideBarInXPMode)
		{
			CRect rectImages = rectClient;
			rectImages.right = rectImages.left + pMenuBar->GetGutterWidth();
			rectImages.DeflateRect(0, 1);
			pDC->FillRect(rectImages, &m_brMenuSideBar);
		}
	}
	else if (pBar->IsKindOf(RUNTIME_CLASS(CMFCMenuBar)))
	{
		pDC->FillRect(rectClient, &m_brWindowCaption);
	}
	else if (pBar->IsKindOf(RUNTIME_CLASS(CA2ToolBox)))
	{
		pDC->FillRect(rectClient, &GetGlobalData()->brWindow);
	}
	else if (pBar->IsKindOf(RUNTIME_CLASS(CMFCToolBar)))
	{
		pDC->FillRect(rectClient, &m_brToolBar);
	}
	else if (pBar->IsKindOf(RUNTIME_CLASS(CPaneDivider)))
	{
		pDC->FillRect(rectClient, &m_brDivider);
	}
	else if (pBar->IsKindOf(RUNTIME_CLASS(CA2BorderPane)))
	{
		pDC->FillRect(rectClient, &m_brDivider);
	}
	else if (pBar->IsKindOf(RUNTIME_CLASS(CMFCRibbonStatusBar)))
	{
		pDC->FillRect(rectClient, m_bDebugMode ? &m_brStatusBarDebugMode : &m_brStatusBar);
	}
	else if (pBar->IsKindOf(RUNTIME_CLASS(CAutoHideDockSite)))
	{
		pDC->FillRect(rectClient, &m_brTabArea);
	}
	else if (pBar->IsKindOf(RUNTIME_CLASS(CMFCAutoHideBar)))
	{
		pDC->FillRect(rectClient, &m_brTabArea);
	}
	else if (pBar->IsKindOf(RUNTIME_CLASS(CDockSite)))
	{
		pDC->FillRect(rectClient, &m_brToolBar);
	}
	else
	{
		// ATLASSERT(FALSE);
		pDC->FillSolidRect(rectClient, RGB(255, 255, 0)); // TEST YELLOW BRUSH
		//__super::OnFillBarBackground(pDC, pBar, rectClient, rectClip, bNCArea);
	}
}

// virtual 
COLORREF CA2VisualManager::OnDrawPaneCaption(CDC* pDC, CDockablePane* pBar, BOOL bActive, CRect rectCaption, CRect rectButtons)
{
	rectCaption.bottom += 2;
	pDC->FillRect(rectCaption, bActive ? &m_brActiveCaption : &m_brInactiveCaption);
	auto pOldBrush = pDC->SelectObject(m_brDockedPaneBorder);
	pDC->PatBlt(rectCaption.left, rectCaption.top, rectCaption.Width(), 1, PATCOPY);
	pDC->PatBlt(rectCaption.left, rectCaption.top, 1, rectCaption.Height() + 1, PATCOPY);
	pDC->PatBlt(rectCaption.right - 1, rectCaption.top, 1, rectCaption.Height() + 1, PATCOPY);
	pDC->SelectObject(pOldBrush);

	return bActive ? COLOR_BLACK : COLOR_WHITE;
}


// virtual 
void CA2VisualManager::OnDrawMiniFrameBorder(CDC* pDC, CPaneFrameWnd* pFrameWnd, CRect rectBorder, CRect rectBorderSize)
{
	// do nothing
}

void CA2VisualManager::OnDrawCaptionButtonXP(CDC* pDC, CMFCCaptionButton* pButton, BOOL bActive, BOOL bHorz, BOOL bMaximized, BOOL bDisabled, int nImageID /*= -1*/)
{
	ASSERT_VALID(pDC);
	ENSURE(pButton != NULL);

	CRect rc = pButton->GetRect();

	if (pButton->m_bPushed && (pButton->m_bFocused || pButton->m_bDroppedDown) && !bDisabled)
	{
		OnFillHighlightedArea(pDC, rc, &m_brHighlightDn, NULL);
		bActive = TRUE;
	}
	else if (pButton->m_bPushed || pButton->m_bFocused || pButton->m_bDroppedDown)
	{
		if (!bDisabled)
		{
			OnFillHighlightedArea(pDC, rc, &m_brHighlight, NULL);
		}

		bActive = FALSE;
	}

	CMenuImages::IMAGES_IDS id = (CMenuImages::IMAGES_IDS) - 1;

	if (nImageID != -1)
	{
		id = (CMenuImages::IMAGES_IDS)nImageID;
	}
	else
	{
		id = pButton->GetIconID(bHorz, bMaximized);
	}

	if (id != (CMenuImages::IMAGES_IDS) - 1)
	{
		CSize sizeImage = CMenuImages::Size();
		CPoint ptImage(rc.left + (rc.Width() - sizeImage.cx) / 2, rc.top + (rc.Height() - sizeImage.cy) / 2);

		OnDrawCaptionButtonIcon(pDC, pButton, id, bActive, bDisabled, ptImage);
	}

	if ((pButton->m_bPushed || pButton->m_bFocused || pButton->m_bDroppedDown) && !bDisabled)
	{
		pDC->Draw3dRect(rc, m_clrMenuItemBorder, m_clrMenuItemBorder);
	}
}

void CA2VisualManager::OnDrawCaptionButton(CDC* pDC, CMFCCaptionButton* pButton, BOOL bActive, BOOL bHorz, BOOL bMaximized, BOOL bDisabled, int nImageID /*= -1*/)
{
	ASSERT_VALID(pDC);
	ASSERT_VALID(pButton);

	if (bActive || pButton->IsMiniFrameButton())
	{
		OnDrawCaptionButtonXP(pDC, pButton, bActive, bHorz, bMaximized, bDisabled, nImageID);
		return;
	}

	CRect rc = pButton->GetRect();

	const BOOL bHighlight = (pButton->m_bPushed || pButton->m_bFocused || pButton->m_bDroppedDown) && !bDisabled;

	if (bHighlight)
	{
		pDC->FillSolidRect(rc, m_clrCaptionButtonBackground);
	}

	CMenuImages::IMAGES_IDS id = (CMenuImages::IMAGES_IDS) - 1;

	if (nImageID != -1)
	{
		id = (CMenuImages::IMAGES_IDS)nImageID;
	}
	else
	{
		id = pButton->GetIconID(bHorz, bMaximized);
	}

	if (id != (CMenuImages::IMAGES_IDS) - 1)
	{
		CSize sizeImage = CMenuImages::Size();
		CPoint ptImage(rc.left + (rc.Width() - sizeImage.cx) / 2, rc.top + (rc.Height() - sizeImage.cy) / 2);

		OnDrawCaptionButtonIcon(pDC, pButton, id, bActive, bDisabled, ptImage);
	}

	if (bHighlight)
	{
		pDC->Draw3dRect(rc, m_clrMenuItemBorder, m_clrMenuItemBorder);
	}
}

COLORREF CA2VisualManager::OnFillMiniFrameCaption(CDC* pDC, CRect rectCaption, CPaneFrameWnd* pFrameWnd, BOOL bActive)
{
	ASSERT_VALID(pDC);
	ASSERT_VALID(pFrameWnd);

	BOOL bIsToolBar = FALSE;
	BOOL bIsTasksPane = pFrameWnd->IsKindOf(RUNTIME_CLASS(CMFCTasksPaneFrameWnd));

	if (DYNAMIC_DOWNCAST(CMFCBaseToolBar, pFrameWnd->GetPane()) != NULL)
	{
		bActive = FALSE;
		bIsToolBar = TRUE;
	}

	if (bIsToolBar)
	{
		pDC->FillRect(rectCaption, &m_brFloatToolBarBorder);
		return GetGlobalData()->clrCaptionText;
	}
	else if (bIsTasksPane)
	{
		pDC->FillRect(rectCaption, &(GetGlobalData()->brBarFace));
		return GetGlobalData()->clrBarText;
	}

	pDC->FillRect(rectCaption, bActive ? &m_brActiveCaption : &m_brInactiveCaption);
	return bActive ? COLOR_BLACK : COLOR_WHITE;
}

// virtual 
void CA2VisualManager::OnEraseTabsArea(CDC* pDC, CRect rect, const CMFCBaseTabCtrl* pTabWnd)
{
	if (pTabWnd->IsDialogControl()) {
		__super::OnEraseTabsArea(pDC, rect, pTabWnd);
		return;
	}
	if (pTabWnd->IsMDITab()) {

		//__super::OnEraseTabsArea(pDC, rect, pTabWnd);
		pDC->FillRect(rect, &m_brTabArea);
		BOOL bIsNotActiveGroup = IsNotActiveMdiGroup(pTabWnd);
		auto pOldBrush = pDC->SelectObject(!bIsNotActiveGroup ? &m_brActiveCaption : &m_brInactiveCaption);
		pDC->PatBlt(rect.left, rect.bottom - 2, rect.Width(), 3, PATCOPY);
		pDC->SelectObject(pOldBrush);
		return;
	}
	CWnd* pParent = pTabWnd->GetParent();
	if (pParent && pParent->IsKindOf(RUNTIME_CLASS(CA2TabView)))
	{
		pDC->FillRect(rect, &m_brBarBkgnd);
		return;
	}
	pDC->FillRect(rect, &m_brTabArea);
	// 1/2 pix left side
	BOOL bFirst = (pTabWnd->GetActiveTab() == 0);
	auto pOld = pDC->SelectObject(bFirst ? &m_brDockedPaneBorder : &m_brInactiveCaption);
	pDC->PatBlt(rect.left, rect.top, 1, rect.Height() - (bFirst ? 1 : 2), PATCOPY);
	pDC->SelectObject(pOld);
}

BOOL CA2VisualManager::IsNotActiveMdiGroup(const CMFCBaseTabCtrl* pTabWnd)
{
	CMFCTabCtrl* pX = DYNAMIC_DOWNCAST(CMFCTabCtrl, pTabWnd);
	if (pX)
		return !pX->IsActiveInMDITabGroup();
	return FALSE;
}

// virtual 
void CA2VisualManager::OnDrawTab(CDC* pDC, CRect rectTab, int iTab, BOOL bIsActive, const CMFCBaseTabCtrl* pTabWnd)
{
	//rectTab.InflateRect(5, 5);
	//pDC->IntersectClipRect(rectTab);
	//::InvalidateRect(pTabWnd->GetSafeHwnd(), NULL, FALSE);
	//pDC->FillSolidRect(rectTab, RGB(255, 255, 0));
	//rectTab.DeflateRect(5, 5);
	if (pTabWnd->IsDialogControl()) {
		__super::OnDrawTab(pDC, rectTab, iTab, bIsActive, pTabWnd);
		return;
	}

	const BOOL bIsHighlight = (iTab == pTabWnd->GetHighlightedTab());

	CWnd* pParent = pTabWnd->GetParent();
	if (pParent && pParent->IsKindOf(RUNTIME_CLASS(CA2TabView)))
	{
		OnDrawTabView(pDC, rectTab, iTab, bIsActive, pTabWnd);
		return;
	}


	if (pTabWnd->IsMDITab())
	{

		BOOL bIsNotActiveTab = IsNotActiveMdiGroup(pTabWnd);
		if (bIsActive && bIsNotActiveTab) {
			bIsActive = FALSE;
		}

		rectTab.InflateRect(1, 1, 0, 0);
		if (bIsActive)
			pDC->FillRect(rectTab, &m_brActiveCaption);
		else {
			pDC->FillRect(rectTab, bIsHighlight ? &m_brHotTab : &m_brInactiveCaption);
			auto pOldBrush = pDC->SelectObject(bIsNotActiveTab ? &m_brInactiveCaption : &m_brActiveCaption);
			pDC->PatBlt(rectTab.left, rectTab.bottom - 2, rectTab.Width(), 2, PATCOPY);
			pDC->SelectObject(pOldBrush);
		}
		OnDrawTabContent(pDC, rectTab, iTab, bIsActive, pTabWnd, bIsActive ? COLOR_BLACK : COLOR_WHITE);
		return;
	}

	rectTab.left--;
	if (bIsActive)
		pDC->FillRect(rectTab, &GetGlobalData()->brWindow);
	else
		pDC->FillRect(rectTab, bIsHighlight ? &m_brHotTab : &m_brInactiveCaption);
	// tab borders
	auto pOldBrush = pDC->SelectObject(&m_brDockedPaneBorder);
	if (bIsActive)
	{
		// bottom, right, [left : if not first only]
		pDC->PatBlt(rectTab.left, rectTab.bottom, rectTab.Width(), 1, PATCOPY);
		pDC->PatBlt(rectTab.right, rectTab.top, 1, rectTab.Height() + 1, PATCOPY);
		if (pTabWnd->GetActiveTab() != 0)
			pDC->PatBlt(rectTab.left, rectTab.top, 1, rectTab.Height() + 1, PATCOPY);
	}
	else
	{
		// top
		pDC->PatBlt(rectTab.left, rectTab.top, rectTab.Width(), 1, PATCOPY);
	}
	pDC->SelectObject(pOldBrush);
	OnDrawTabContent(pDC, rectTab, iTab, bIsActive, pTabWnd, bIsActive ? COLOR_BLACK : COLOR_WHITE);
}

void CA2VisualManager::OnDrawTabView(CDC* pDC, CRect rectTab, int iTab, BOOL bIsActive, const CMFCBaseTabCtrl* pTabWnd)
{
	const BOOL bIsHighlight = (iTab == pTabWnd->GetHighlightedTab());

	if (iTab == 0)
		rectTab.left--;
	if (bIsActive)
		pDC->FillRect(rectTab, &GetGlobalData()->brWindow);
	else
		pDC->FillRect(rectTab, bIsHighlight ? &m_brHighlight : &m_brTabViewArea);
	// tab borders
	auto pOldBrush = pDC->SelectObject(m_brTabViewBorder);
	if (bIsActive)
	{
		pDC->PatBlt(rectTab.right, rectTab.top, 1, rectTab.Height() + 1, PATCOPY);
	}
	else
	{
		pDC->PatBlt(rectTab.right, rectTab.top, 1, rectTab.Height() + 1, PATCOPY);
		pDC->PatBlt(rectTab.left, rectTab.top, rectTab.Width(), 1, PATCOPY);
	}
	pDC->SelectObject(pOldBrush);
	//OnDrawTabContent(pDC, rectTab, iTab, bIsActive, pTabWnd, (bIsActive || bIsHighlight) ? COLOR_BLACK : m_clrInactiveTabText);
	OnDrawTabContent(pDC, rectTab, iTab, bIsActive, pTabWnd, COLOR_BLACK);
}

//virtual 
void CA2VisualManager::OnDrawTabContent(CDC* pDC, CRect rectTab, int iTab, BOOL bIsActive, const CMFCBaseTabCtrl* pTabWnd, COLORREF clrText)
{
	if (pTabWnd->IsMDITab())
	{
		OnDrawTabContentMDI(pDC, rectTab, iTab, bIsActive, pTabWnd, clrText);
		return;
	}
	__super::OnDrawTabContent(pDC, rectTab, iTab, bIsActive, pTabWnd, clrText);
}

void CA2VisualManager::OnDrawTabContentMDI(CDC* pDC, CRect rectTab, int iTab, BOOL bIsActive, const CMFCBaseTabCtrl* pTabWnd, COLORREF clrText)
{
	ASSERT_VALID(pTabWnd);
	ASSERT_VALID(pDC);

	if (pTabWnd->IsActiveTabCloseButton() && bIsActive)
	{
		CRect rectClose = pTabWnd->GetTabCloseButton();
		rectTab.right = rectClose.left;

		OnDrawTabCloseButton(pDC, rectClose, pTabWnd, pTabWnd->IsTabCloseButtonHighlighted(), pTabWnd->IsTabCloseButtonPressed(), FALSE /* Disabled */);
	}

	CString strText;
	pTabWnd->GetTabLabel(iTab, strText);
	//---------------
	// Draw tab text:
	//---------------
	pDC->SetTextColor(clrText);
	auto pOldFont = pDC->SelectObject(GetGlobalData()->fontRegular);
	UINT nFormat = DT_SINGLELINE | DT_CENTER | DT_VCENTER;
	if (pTabWnd->IsDrawNoPrefix())
	{
		nFormat |= DT_NOPREFIX;
	}

	AdjustTabTextRect(rectTab);
	pDC->DrawText(strText, rectTab, nFormat);
	pDC->SelectObject(pOldFont);
}

// virtual 
void CA2VisualManager::GetTabFrameColors(const CMFCBaseTabCtrl* pTabWnd,
	COLORREF& clrDark, COLORREF& clrBlack,
	COLORREF& clrHighlight, COLORREF& clrFace, COLORREF& clrDarkShadow,
	COLORREF& clrLight, CBrush*& pbrFace, CBrush*& pbrBlack)
{
	__super::GetTabFrameColors(pTabWnd, clrDark, clrBlack, clrHighlight,
		clrFace, clrDarkShadow, clrLight, pbrFace, pbrBlack);
	if (pTabWnd->IsDialogControl()) {
		return;
	}

	CWnd* pParent = pTabWnd->GetParent();
	if (pParent && pParent->IsKindOf(RUNTIME_CLASS(CA2TabView)))
	{
		pbrFace = &m_brTabViewBorder; // border around
		return;
	}

	// этим цветом закрашивается разделитель групп и рамки
	pbrFace = pTabWnd->IsMDITab() ? &m_brDivider : &m_brDockedPaneBorder;

	clrDark = m_clrDivider; // RGB(255, 0, 255); // border around
	clrBlack = RGB(255, 255, 0);
	clrHighlight = RGB(0, 255, 255); // линия сверху (не в табах)
	clrFace = RGB(255, 0, 255);
	clrDarkShadow = RGB(255, 255, 0);
	clrLight = RGB(0, 255, 255);
	pbrBlack = &m_brActiveCaption; // &m_brDockedPaneBorder;
	if (pTabWnd->IsMDITab())
	{
		// линия сверху (не в табах)
		clrHighlight = IsNotActiveMdiGroup(pTabWnd) ? m_clrInactiveCaption : m_clrActiveCaption;
	}
}

// virtual 
BOOL CA2VisualManager::OnEraseTabsFrame(CDC* pDC, CRect rect, const CMFCBaseTabCtrl* pTabWnd)
{
	if (pTabWnd->IsMDITab()) {
		rect.DeflateRect(1, 1);
		pDC->FrameRect(rect, &m_brDockedPaneBorder);
		return TRUE;
	}
	return __super::OnEraseTabsFrame(pDC, rect, pTabWnd);
}

// virtual 
void CA2VisualManager::OnDrawTabCloseButton(CDC* pDC, CRect rect, const CMFCBaseTabCtrl* pTabWnd, BOOL bIsHighlighted, BOOL bIsPressed, BOOL bIsDisabled)
{
	__super::OnDrawTabCloseButton(pDC, rect, pTabWnd, bIsHighlighted, bIsPressed, bIsDisabled);
}


BOOL CA2VisualManager::OnEraseMDIClientArea(CDC* pDC, CRect rectClient)
{
	if (m_brMainClientArea.GetSafeHandle() == NULL)
	{
		return __super::OnEraseMDIClientArea(pDC, rectClient);
	}

	pDC->FillRect(rectClient, &m_brMainClientArea);
	return TRUE;
}

void CA2VisualManager::OnDrawSeparator(CDC* pDC, CBasePane* pBar, CRect rect, BOOL bHorz)
{
	ASSERT_VALID(pDC);
	ASSERT_VALID(pBar);

	if (pBar->IsDialogControl())
	{
		CMFCVisualManager::OnDrawSeparator(pDC, pBar, rect, bHorz);
		return;
	}

	//CRect rectSeparator = rect;

	CPen* pOldPen = pDC->SelectObject(&m_penSeparator);
	ENSURE(pOldPen != NULL);

	int x1, x2;
	int y1, y2;

	if (bHorz)
	{
		x1 = x2 = (rect.left + rect.right) / 2;
		y1 = rect.top;
		y2 = rect.bottom - 1;
	}
	else
	{
		y1 = y2 = (rect.top + rect.bottom) / 2;
		x1 = rect.left;
		x2 = rect.right;

		if (pBar->IsKindOf(RUNTIME_CLASS(CA2ToolBox)))
		{
			y1 += 10;
			y2 += 10;
		}
		else 
		{
			BOOL bIsRibbon = FALSE;

			bIsRibbon = pBar->IsKindOf(RUNTIME_CLASS(CMFCRibbonPanelMenuBar));

			if (bIsRibbon && ((CMFCRibbonPanelMenuBar*)pBar)->IsDefaultMenuLook())
			{
				bIsRibbon = FALSE;
			}

			if (pBar->IsKindOf(RUNTIME_CLASS(CMFCPopupMenuBar)) && !bIsRibbon && !pBar->IsKindOf(RUNTIME_CLASS(CMFCColorBar)))
			{

				//x1 = rect.left + CMFCToolBar::GetMenuImageSize().cx + GetMenuImageMargin() + 1;
				x1 = rect.left + CMFCToolBar::GetMenuImageSize().cx + GetMenuImageMargin();
				CRect rectBar;
				pBar->GetClientRect(rectBar);

				if (rectBar.right - x2 < 50) // Last item in row
				{
					x2 = rectBar.right - 3;
				}

				if (((CMFCPopupMenuBar*)pBar)->m_bDisableSideBarInXPMode)
				{
					x1 = 0;
				}

				//---------------------------------
				// Maybe Quick Customize separator
				//---------------------------------
				if (pBar->IsKindOf(RUNTIME_CLASS(CMFCPopupMenuBar)))
				{
					CWnd* pWnd = pBar->GetParent();
					if (pWnd != NULL && pWnd->IsKindOf(RUNTIME_CLASS(CMFCPopupMenu)))
					{
						CMFCPopupMenu* pMenu = (CMFCPopupMenu*)pWnd;
						if (pMenu->IsCustomizePane())
						{
							x1 = rect.left + 2 * CMFCToolBar::GetMenuImageSize().cx + 3 * GetMenuImageMargin() + 2;
						}
					}
				}
			}

		}
	}

	pDC->MoveTo(x1, y1);
	pDC->LineTo(x2, y2);

	pDC->SelectObject(pOldPen);
}

void CA2VisualManager::OnEraseTabsButton(CDC* pDC, CRect rect,
	CMFCButton* pButton, CMFCBaseTabCtrl* pWndTab)
{
	if (!pWndTab->IsMDITab())
	{
		__super::OnEraseTabsButton(pDC, rect, pButton, pWndTab);
		return;
	}
	if (pButton->IsPressed())
	{
		// first!
		pDC->FillRect(rect, &m_brHighlightDn);
		pButton->SetStdImage(CMenuImages::IdArrowDownLarge, CMenuImages::ImageDkGray);
	}
	else if (pButton->IsHighlighted())
	{
		pDC->FillRect(rect, &m_brHighlight);
		pButton->SetStdImage(CMenuImages::IdArrowDownLarge, CMenuImages::ImageDkGray);
	}
	else
	{
		pDC->FillRect(rect, &m_brTabArea);
		pButton->SetStdImage(CMenuImages::IdArrowDownLarge, CMenuImages::ImageWhite);
	}
}


void CA2VisualManager::OnDrawA2CaptionButton(CDC* pDC, CRect rect, UINT nID, bool bHighlighted, bool bPressed, bool bDisabled)
{
	if (bDisabled) {
		// do nothing
	} 
	else if (bPressed)
	{
		pDC->FillRect(rect, &m_brHighlightDn);
		pDC->Draw3dRect(rect, m_clrMenuItemBorder, m_clrMenuItemBorder);
	}
	else if (bHighlighted)
	{
		pDC->FillRect(rect, &m_brHighlight);
		pDC->Draw3dRect(rect, m_clrMenuItemBorder, m_clrMenuItemBorder);
	}
	auto pMI = CMFCToolBar::GetImages();
	if (!pMI)
		return;
	CAfxDrawState ds;
	pMI->PrepareDrawImage(ds);
	CSize imageSize(pMI->GetImageSize());
	int dy = (rect.Height() - imageSize.cy) / 2;
	int dx = (rect.Width() - imageSize.cx) / 2;
	int iImage = GetCmdMgr()->GetCmdImage(nID);
	pMI->Draw(pDC, rect.left + dx, rect.top + dy, iImage, FALSE/*hilite*/, bDisabled ? TRUE : FALSE /*disabled*/);
	pMI->EndDrawImage(ds);
}

// virtual 
void CA2VisualManager::OnFillAutoHideButtonBackground(CDC* pDC, CRect rect, CMFCAutoHideButton* pButton)
{
	DWORD dwAlign = pButton->GetAlignment() & CBRS_ALIGN_ANY;
	if ((dwAlign == CBRS_ALIGN_LEFT) || (dwAlign == CBRS_ALIGN_RIGHT))
		rect.bottom -= AUTO_HIDE_BUTTONS_GAP;
	else if ((dwAlign == CBRS_ALIGN_TOP) || (dwAlign == CBRS_ALIGN_BOTTOM))
		rect.right -= AUTO_HIDE_BUTTONS_GAP;
	if (pButton->IsHighlighted())
		pDC->FillRect(rect, &m_brHotTab);
	else
		pDC->FillRect(rect, &m_brInactiveCaption);
}

// virtual 
void CA2VisualManager::OnDrawAutoHideButtonBorder(CDC* pDC, CRect rectBounds, CRect rectBorderSize, CMFCAutoHideButton* pButton)
{
	DWORD dwAlign = pButton->GetAlignment() & CBRS_ALIGN_ANY;

	if ((dwAlign == CBRS_ALIGN_LEFT) || (dwAlign == CBRS_ALIGN_RIGHT))
		rectBounds.bottom -= AUTO_HIDE_BUTTONS_GAP;
	else if ((dwAlign == CBRS_ALIGN_TOP) || (dwAlign == CBRS_ALIGN_BOTTOM))
		rectBounds.right -= AUTO_HIDE_BUTTONS_GAP;

	CBrush* pOld = nullptr;
	if (pButton->IsHighlighted())
		pOld = pDC->SelectObject(&m_brDockedPaneBorder);
	else
		pOld = pDC->SelectObject(&m_brHotTab);
	if (dwAlign == CBRS_ALIGN_RIGHT)
		pDC->PatBlt(rectBounds.right - 3, rectBounds.top, 3, rectBounds.Height(), PATCOPY);
	else if (dwAlign == CBRS_ALIGN_TOP)
		pDC->PatBlt(rectBounds.left, rectBounds.top, rectBounds.Width(), 3, PATCOPY);
	else if (dwAlign == CBRS_ALIGN_BOTTOM)
		pDC->PatBlt(rectBounds.left, rectBounds.bottom - 3, rectBounds.Width(), 3, PATCOPY);
	else
		pDC->PatBlt(rectBounds.left, rectBounds.top, 3, rectBounds.Height(), PATCOPY);
	pDC->SelectObject(pOld);
}

// virtual 
COLORREF CA2VisualManager::GetAutoHideButtonTextColor(CMFCAutoHideButton* pButton)
{
	return COLOR_WHITE;
}

// virtual 
COLORREF CA2VisualManager::GetRibbonHyperlinkTextColor(CMFCRibbonLinkCtrl* pHyperLink)
{
	return RGB(255, 255, 0);
}
// virtual 
COLORREF CA2VisualManager::GetRibbonStatusBarTextColor(CMFCRibbonStatusBar* pStatusBar)
{
	return COLOR_WHITE;
}

void CA2VisualManager::OnFillButtonInterior(CDC* pDC, CMFCToolBarButton* pButton, CRect rect, CMFCVisualManager::AFX_BUTTON_STATE state)
{
	ASSERT_VALID(pDC);
	ASSERT_VALID(pButton);
	CMFCToolBarMenuButton* pMenuButton =
		DYNAMIC_DOWNCAST(CMFCToolBarMenuButton, pButton);

	BOOL bIsMenuBarButton = (pMenuButton != nullptr) &&
		(pMenuButton->GetParentWnd() != nullptr) &&
		pMenuButton->GetParentWnd()->IsKindOf(RUNTIME_CLASS(CMFCMenuBar));

	BOOL bIsToolbox =
		(pButton->GetParentWnd() != nullptr) &&
		pButton->GetParentWnd()->IsKindOf(RUNTIME_CLASS(CA2ToolBox));

	if (bIsMenuBarButton && pMenuButton->IsDroppedDown()) {
		rect.bottom += 2;
		pDC->FillRect(rect, &m_brMenuLight);
	}
	else if (pMenuButton && pMenuButton->IsDroppedDown()) {
		rect.bottom += 2;
		pDC->FillRect(rect, &m_brMenuLight);
	}
	else if (bIsToolbox)
	{
		if ((pButton->m_nStyle & TBBS_CHECKED) && (state != CMFCVisualManager::AFX_BUTTON_STATE::ButtonsIsHighlighted))
			pDC->FillRect(rect, &m_brHighlightDn);
		else
			__super::OnFillButtonInterior(pDC, pButton, rect, state);
	}
	else
	{
		__super::OnFillButtonInterior(pDC, pButton, rect, state);
	}
}

// virtual
void CA2VisualManager::OnHighlightMenuItem(CDC* pDC, CMFCToolBarMenuButton* pButton, CRect rect, COLORREF& clrText)
{
	ASSERT_VALID(pDC);
	ASSERT_VALID(pButton);

	CBrush* pBrush = (pButton->m_nStyle & TBBS_DISABLED) ? &m_brMenuLight : &m_brHighlight;

	rect.DeflateRect(1, 0);

	OnFillHighlightedArea(pDC, rect, pBrush, pButton);
	if ((pButton->m_nStyle & TBBS_DISABLED) == 0)
		pDC->Draw3dRect(rect, m_clrMenuItemBorder, m_clrMenuItemBorder);
	else
		pDC->Draw3dRect(rect, m_clrSeparator, m_clrSeparator);

	clrText = GetHighlightedMenuItemTextColor(pButton);
}

// virtual 
void CA2VisualManager::OnDrawButtonBorder(CDC* pDC, CMFCToolBarButton* pButton, CRect rect, CMFCVisualManager::AFX_BUTTON_STATE state)
{
	ASSERT_VALID(pDC);
	ASSERT_VALID(pButton);
	CMFCToolBarMenuButton* pMenuButton =
		DYNAMIC_DOWNCAST(CMFCToolBarMenuButton, pButton);
	BOOL bIsMenuBarButton = (pMenuButton != nullptr) &&
		(pMenuButton->GetParentWnd() != nullptr) &&
		pMenuButton->GetParentWnd()->IsKindOf(RUNTIME_CLASS(CMFCPopupMenuBar));

	if (pMenuButton && bIsMenuBarButton)
	{
		// checked or radio popup menu
		pDC->Draw3dRect(rect, m_clrMenuSideBar, m_clrMenuSideBar);
		return;
	}
	__super::OnDrawButtonBorder(pDC, pButton, rect, state);
}

// virtual 
void CA2VisualManager::OnDrawComboDropButton(CDC* pDC, CRect rect, BOOL bDisabled, BOOL bIsDropped, BOOL bIsHighlighted, CMFCToolBarComboBoxButton* pButton)
{
	ASSERT_VALID(pDC);
	ASSERT_VALID(this);

	rect.InflateRect(1, 1, 1, 0);
	if (!bDisabled)
	{
		if (bIsDropped || bIsHighlighted)
		{
			OnFillHighlightedArea(pDC, rect, bIsDropped ? &m_brHighlightDn : &m_brHighlight, NULL);

			CPen pen(PS_SOLID, 1, m_clrMenuItemBorder);
			CPen* pOldPen = pDC->SelectObject(&pen);
			ENSURE(pOldPen != NULL);

			pDC->MoveTo(rect.left, rect.top);
			pDC->LineTo(rect.left, rect.bottom);

			pDC->SelectObject(pOldPen);

		}
	}
	else
	{
		OnFillHighlightedArea(pDC, rect, &m_brMenuSideBar, NULL);
	}
	CMenuImages::Draw(pDC, CMenuImages::IdArrowDown, rect, bDisabled ? CMenuImages::ImageGray : CMenuImages::ImageBlack);
}

void CA2VisualManager::OnDrawComboBorder(CDC* pDC, CRect rect, BOOL bDisabled, BOOL bIsDropped, BOOL bIsHighlighted, CMFCToolBarComboBoxButton* pButton)
{
	rect.bottom--;
	COLORREF colorWindow = GetGlobalData()->clrWindow;
	if (bIsHighlighted || bIsDropped || bDisabled)
	{
		COLORREF colorBorder = bDisabled ? colorWindow : m_clrMenuItemBorder;
		pDC->Draw3dRect(&rect, colorBorder, colorBorder);
	}
	else
	{
		pDC->Draw3dRect(&rect, m_clrSeparator, m_clrSeparator);
	}
	rect.DeflateRect(1, 1);
	pDC->Draw3dRect(&rect, colorWindow, colorWindow);
}

// virtual 
COLORREF CA2VisualManager::GetToolbarButtonTextColor(CMFCToolBarButton* pButton, CMFCVisualManager::AFX_BUTTON_STATE state)
{
	return COLOR_BLACK;
}


// virtual 
void CA2VisualManager::OnDrawHeaderCtrlBorder(CMFCHeaderCtrl* pCtrl, CDC* pDC, CRect& rect, BOOL bIsPressed, BOOL bIsHighlighted)
{
	if (pCtrl->IsDialogControl())
	{
		__super::OnDrawHeaderCtrlBorder(pCtrl, pDC, rect, bIsPressed, bIsHighlighted);
		return;
	}
	COLORREF color = bIsHighlighted ? RGB(255, 0, 0) : RGB(255, 0, 255);

	if (bIsPressed) {
		pDC->FillRect(rect, &m_brHighlightDn);
	}
	else if (bIsHighlighted) 
	{
		pDC->FillRect(rect, &m_brHighlight);
	}
	CPen pen(PS_SOLID, 0, m_clrHeaderBorder);
	CPen* pOld = pDC->SelectObject(&pen);
	pDC->MoveTo(rect.right, rect.bottom - 1);
	pDC->LineTo(rect.left, rect.bottom - 1);
	if (rect.left > 0) {
		// для первого НЕ рисуем левую границу
		pDC->LineTo(rect.left, rect.top);
	}
	pDC->SelectObject(pOld);
}

// virtual 
void CA2VisualManager::OnFillHeaderCtrlBackground(CMFCHeaderCtrl* pCtrl, CDC* pDC, CRect rect)
{
	if (pCtrl->IsDialogControl())
	{
		__super::OnFillHeaderCtrlBackground(pCtrl, pDC, rect);
		return;
	}
	pDC->FillRect(rect, &m_brHeaderBack);
	// hot and pressed states draw in OnDrawHeaderCtrlBorder
}

// virtual 
void CA2VisualManager::OnDrawHeaderCtrlSortArrow(CMFCHeaderCtrl* pCtrl, CDC* pDC, CRect& rect, BOOL bIsUp)
{
	if (pCtrl->IsDialogControl()) {
		__super::OnDrawHeaderCtrlSortArrow(pCtrl, pDC, rect, bIsUp);
		return;
	}
	// ATLTRACE(L"w:%d, h:%d\n", rect.Width(), rect.Height());
	// may be 14x12 or 15x11
	// HACK
	CPoint pt(rect.TopLeft());
	pt.x += 2;
	pt.y += (rect.Height() == 12) ? 1 : 0;
	CImageList* pImageList = CTheme::GetImageList(CTheme::ImageList10x10);
	pImageList->Draw(pDC, bIsUp ? 2 : 1, pt, ILD_TRANSPARENT);
}

COLORREF CA2VisualManager::OnDrawPropertySheetListItem(CDC* pDC, CMFCPropertySheet* /*pParent*/, CRect rect, BOOL bIsHighlihted, BOOL bIsSelected)
{
	ASSERT_VALID(pDC);

	CBrush* pBrush = NULL;

	if (bIsSelected)
	{
		pBrush = &m_brHighlightDn;
	}
	else if (bIsHighlihted)
	{
		pBrush = &m_brHighlight;
	}

	OnFillHighlightedArea(pDC, rect, pBrush, NULL);
	pDC->Draw3dRect(rect, m_clrMenuItemBorder, m_clrMenuItemBorder);

	return GetGlobalData()->clrBtnText;
}

// virtual 
COLORREF CA2VisualManager::OnDrawRibbonStatusBarPane(CDC* pDC, CMFCRibbonStatusBar* pBar, CMFCRibbonStatusBarPane* pPane)
{
	__super::OnDrawRibbonStatusBarPane(pDC, pBar, pPane);
	return COLOR_WHITE;
}
