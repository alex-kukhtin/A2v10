// a2dockablepane.cpp : implementation file
//

#include "stdafx.h"
#include "../include/a2dockablepane.h"
#include "../include/a2toolbars.h"
#include "../include/a2toolbox.h"
#include "../include/appdefs.h"
#include "../include/appdata.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif

static const CString strDummyAmpSeq = _T("\001\001");
static const int nTextMargin = 1;
static const int nDefaultWidth = 144;


class CMFCToolBarButtonUP : public CMFCToolBarButton
{
	friend class CA2ToolBox;
};

IMPLEMENT_DYNAMIC(CA2ToolBox, CA2MFCToolBar)

CA2ToolBox::CA2ToolBox()
	: m_nWidth(nDefaultWidth)
{

}

CA2ToolBox::~CA2ToolBox()
{
}

BEGIN_MESSAGE_MAP(CA2ToolBox, CA2MFCToolBar)
END_MESSAGE_MAP()

// virtual 
CSize CA2ToolBox::CalcFixedLayout(BOOL bStretch, BOOL bHorz)
{
	//return __super::CalcFixedLayout(bStretch, bHorz);
	return CSize(m_nWidth, 32767);
}

void CA2ToolBox::AdjustLocations()
{
	ASSERT_VALID(this);

	if (m_Buttons.IsEmpty() || GetSafeHwnd() == NULL)
	{
		return;
	}

	BOOL bHorz;// = GetCurrentAlignment() & CBRS_ORIENT_HORZ ? TRUE : FALSE;
	bHorz = TRUE;

	CRect rectClient;
	GetClientRect(rectClient);
	rectClient.top += 4; // %%%%

	int xRight = rectClient.right;

	CClientDC dc(this);
	CFont* pOldFont;
	if (bHorz)
	{
		pOldFont = SelectDefaultFont(&dc);
	}
	else
	{
		pOldFont = (CFont*)dc.SelectObject(&afxGlobalData.fontVert);
	}

	ENSURE(pOldFont != NULL);

	int iStartOffset;
	if (bHorz)
	{
		iStartOffset = rectClient.left + 1;
	}
	else
	{
		iStartOffset = rectClient.top + 1;
	}

	int iOffset = iStartOffset;
	int y = rectClient.top;

	CSize sizeGrid(GetColumnWidth(), GetRowHeight());

	BOOL bPrevWasSeparator = FALSE;
	int nRowActualWidth = 0;
	for (POSITION pos = m_Buttons.GetHeadPosition(); pos != NULL;)
	{
		POSITION posSave = pos;

		CMFCToolBarButton* pButton = (CMFCToolBarButton*)m_Buttons.GetNext(pos);
		if (pButton == NULL)
		{
			break;
		}

		ASSERT_VALID(pButton);
		pButton->m_bWrap = TRUE;
		//((CMFCToolBarButtonUP*)pButton)->m_bHorz = TRUE;

		BOOL bVisible = TRUE;

		CSize sizeButton = pButton->OnCalculateSize(&dc, sizeGrid, bHorz);
		if (pButton->m_bTextBelow && bHorz)
		{
			sizeButton.cy = sizeGrid.cy;
		}

		if (pButton->m_nStyle & TBBS_SEPARATOR)
		{
			if (iOffset == iStartOffset || bPrevWasSeparator)
			{
				sizeButton = CSize(0, 0);
				bVisible = FALSE;
			}
			else
			{
				bPrevWasSeparator = TRUE;
			}
		}

		int iOffsetPrev = iOffset;

		CRect rectButton;
		if (bHorz)
		{
			rectButton.left = iOffset;
			rectButton.right = rectButton.left + sizeButton.cx;
			rectButton.top = y;
			rectButton.bottom = rectButton.top + sizeButton.cy;

			iOffset += sizeButton.cx;
			nRowActualWidth += sizeButton.cx;
		}
		else
		{
			rectButton.left = rectClient.left;
			rectButton.right = rectClient.left + sizeButton.cx;
			rectButton.top = iOffset;
			rectButton.bottom = iOffset + sizeButton.cy;

			iOffset += sizeButton.cy;
		}

		pButton->Show(bVisible);
		//rectButton.left += 2; // %%%%
		rectButton.right = rectButton.left + (m_nWidth - 16); // %%%
		pButton->SetRect(rectButton);

		if (bVisible)
		{
			bPrevWasSeparator = (pButton->m_nStyle & TBBS_SEPARATOR);
		}

		if ((pButton->m_bWrap || pos == NULL) && bHorz)
		{
			// Center buttons in row:
			int nShift = 0; // (xRight - nRowActualWidth - iStartOffset) / 2;%%%
			if (IsFloating() && /*nShift > 0 &&*/ m_bTextLabels)
			{
				for (POSITION posRow = posSave; posRow != NULL;)
				{
					BOOL bThis = (posRow == posSave);

					CMFCToolBarButton* pButtonRow = (CMFCToolBarButton*)m_Buttons.GetPrev(posRow);
					ENSURE(pButtonRow != NULL);

					if (pButtonRow->m_bWrap && !bThis)
					{
						break;
					}

					CRect rect = pButtonRow->Rect();
					rect.OffsetRect(nShift, 0);
					pButtonRow->SetRect(rect);
				}
			}

			iOffset = iStartOffset;
			nRowActualWidth = 0;
			y += sizeGrid.cy; // %%%+ AFX_TOOLBAR_LINE_OFFSET;
		}
	}

	dc.SelectObject(pOldFont);
	UpdateTooltips();
	RedrawCustomizeButton();
}

// virtual 
BOOL CA2ToolBox::DrawButton(CDC* pDC, CMFCToolBarButton* pButton, CMFCToolBarImages* pImages, BOOL bHighlighted, BOOL bDrawDisabledImages)
{
	ASSERT_VALID(pDC);
	ASSERT_VALID(pButton);

	if (!pButton->IsVisible() || pButton->IsHidden() || !pDC->RectVisible(pButton->Rect()))
	{
		return TRUE;
	}

	BOOL bHorz = TRUE; //GetCurrentAlignment() & CBRS_ORIENT_HORZ ? TRUE : FALSE;

					   // Draw button context:
					   //pButton->OnDraw(pDC, pButton->Rect(), pImages, bHorz, IsCustomizeMode() && !m_bAltCustomizeMode && !m_bLocked,
					   //bHighlighted, m_bShowHotBorder, m_bGrayDisabledButtons && !bDrawDisabledImages);

	DoDrawButton((CMFCToolBarButtonUP*)pButton, pDC, pButton->Rect(), pImages, bHorz, IsCustomizeMode() && !m_bAltCustomizeMode && !m_bLocked,
		bHighlighted, m_bShowHotBorder, m_bGrayDisabledButtons && !bDrawDisabledImages);
	return TRUE;
}

void CA2ToolBox::DoPaint(CDC* pDCPaint)
{
	ASSERT_VALID(this);
	ASSERT_VALID(pDCPaint);

	CRect rectClip;
	pDCPaint->GetClipBox(rectClip);

	BOOL bHorz = TRUE; // GetCurrentAlignment() & CBRS_ORIENT_HORZ ? TRUE : FALSE;

	CRect rectClient;
	GetClientRect(rectClient);

	CMemDC memDC(*pDCPaint, this);
	CDC* pDC = &memDC.GetDC();

	if ((GetStyle() & TBSTYLE_TRANSPARENT) == 0)
	{
		SetPaneStyle(GetPaneStyle() & ~CBRS_ORIENT_HORZ); //%%%
		CMFCVisualManager::GetInstance()->OnFillBarBackground(pDC, this, rectClient, rectClip);
		SetPaneStyle(GetPaneStyle() | CBRS_ORIENT_HORZ);  //%%%
	}
	else
	{
		//m_Impl.GetBackgroundFromParent(pDC);
	}

	OnFillBackground(pDC);

	pDC->SetTextColor(afxGlobalData.clrBtnText);
	pDC->SetBkMode(TRANSPARENT);

	CRect rect;
	GetClientRect(rect);

	// Force the full size of the button:
	if (bHorz)
	{
		rect.bottom = rect.top + GetRowHeight();
	}
	else
	{
		rect.right = rect.left + GetColumnWidth();
	}

	CMFCToolBarImages* pImages = GetImageList(m_Images, m_ImagesLocked, m_LargeImages, m_LargeImagesLocked);
	CMFCToolBarImages* pHotImages = pImages;
	CMFCToolBarImages* pColdImages = GetImageList(m_ColdImages, m_ColdImagesLocked, m_LargeColdImages, m_LargeColdImagesLocked);
	CMFCToolBarImages* pDisabledImages = GetImageList(m_DisabledImages, m_DisabledImagesLocked, m_LargeDisabledImages, m_LargeDisabledImagesLocked);
	CMFCToolBarImages* pMenuImages = !m_bLocked ? &m_MenuImages : &m_MenuImagesLocked;
	CMFCToolBarImages* pDisabledMenuImages = !m_bLocked ? &m_DisabledMenuImages : &m_DisabledMenuImagesLocked;

	BOOL bDrawImages = pImages->IsValid();

	pHotImages->SetTransparentColor(afxGlobalData.clrBtnFace);

	BOOL bFadeInactiveImages = CMFCVisualManager::GetInstance()->IsFadeInactiveImage();

	CAfxDrawState ds;
	if (bDrawImages && !pHotImages->PrepareDrawImage(ds, m_bMenuMode ? m_sizeMenuImage : GetImageSize(), bFadeInactiveImages))
	{
		return;     // something went wrong
	}

	CFont* pOldFont;
	if (bHorz)
	{
		pOldFont = SelectDefaultFont(pDC);
	}
	else
	{
		pOldFont = (CFont*)pDC->SelectObject(&afxGlobalData.fontVert);
	}

	if (pColdImages->GetCount() > 0)
	{
		// Disable fade effect for inactive buttons:
		CMFCVisualManager::GetInstance()->SetFadeInactiveImage(FALSE);
	}

	// Draw buttons:
	int iButton = 0;
	for (POSITION pos = m_Buttons.GetHeadPosition(); pos != NULL; iButton++)
	{
		CMFCToolBarButton* pButton = (CMFCToolBarButton*)m_Buttons.GetNext(pos);
		if (pButton == NULL)
		{
			break;
		}

		ASSERT_VALID(pButton);

		rect = pButton->Rect();
		CRect rectInter;

		if (pButton->m_nStyle & TBBS_SEPARATOR)
		{
			BOOL bHorzSeparator = bHorz;
			CRect rectSeparator; rectSeparator.SetRectEmpty();

			OnCalcSeparatorRect(pButton, rectSeparator, bHorz);
			rectSeparator.bottom = rectSeparator.top + 2;

			if (pButton->m_bWrap && bHorz)
			{
				bHorzSeparator = FALSE;
			}

			//if (rectInter.IntersectRect(rectSeparator, rectClip) && !pButton->IsHidden())
			//{
			DrawSeparator(pDC, rectSeparator, bHorzSeparator);
			//}

			continue;
		}

		if (!rectInter.IntersectRect(rect, rectClip))
		{
			continue;
		}

		BOOL bHighlighted = IsButtonHighlighted(iButton);
		BOOL bDisabled = (pButton->m_nStyle & TBBS_DISABLED) && !IsCustomizeMode();

		if (pDC->RectVisible(&rect))
		{
			BOOL bDrawDisabledImages = FALSE;

			if (bDrawImages)
			{
				CMFCToolBarImages* pNewImages = NULL;

				if (pButton->m_bUserButton)
				{
					if (pButton->GetImage() >= 0)
					{
						pNewImages = m_pUserImages;
					}
				}
				else
				{
					if (m_bMenuMode)
					{
						if (bDisabled && pDisabledMenuImages->GetCount() > 0)
						{
							bDrawDisabledImages = TRUE;
							pNewImages = pDisabledMenuImages;
						}
						else if (pMenuImages->GetCount() > 0)
						{
							pNewImages = pMenuImages;
						}
						else
						{
							bDrawDisabledImages = (bDisabled && pDisabledImages->GetCount() > 0);
							pNewImages = bDrawDisabledImages ? pDisabledImages : pHotImages;
						}
					}
					else // Toolbar mode
					{
						bDrawDisabledImages = (bDisabled && pDisabledImages->GetCount() > 0);
						pNewImages = bDrawDisabledImages ? pDisabledImages : pHotImages;

						if (!bHighlighted && !bDrawDisabledImages && (pButton->m_nStyle & TBBS_PRESSED) == 0 && pColdImages->GetCount() > 0 && !pButton->IsDroppedDown())
						{
							pNewImages = pColdImages;
						}
					}
				}

				if (bDrawImages && pNewImages != pImages && pNewImages != NULL)
				{
					pImages->EndDrawImage(ds);

					pNewImages->SetTransparentColor(afxGlobalData.clrBtnFace);
					pNewImages->PrepareDrawImage(ds, m_bMenuMode ? m_sizeMenuImage : GetImageSize(), bFadeInactiveImages);

					pImages = pNewImages;
				}
			}

			DrawButton(pDC, pButton, bDrawImages ? pImages : NULL, bHighlighted, bDrawDisabledImages);
		}
	}

	// Highlight selected button in the toolbar customization mode:
	if (m_iSelected >= m_Buttons.GetCount())
	{
		m_iSelected = -1;
	}

	if ((IsCustomizeMode() || m_bAltCustomizeMode) && m_iSelected >= 0 && !m_bLocked && m_pSelToolbar == this)
	{
		CMFCToolBarButton* pSelButton = GetButton(m_iSelected);
		ENSURE(pSelButton != NULL);

		if (pSelButton != NULL && pSelButton->CanBeStored())
		{
			CRect rectDrag1 = pSelButton->Rect();

			pDC->Draw3dRect(&rectDrag1, afxGlobalData.clrBtnText, afxGlobalData.clrBtnText);
			rectDrag1.DeflateRect(1, 1);
			pDC->Draw3dRect(&rectDrag1, afxGlobalData.clrBtnText, afxGlobalData.clrBtnText);
		}
	}

	if (IsCustomizeMode() && m_iDragIndex >= 0 && !m_bLocked)
	{
		DrawDragCursor(pDC);
	}

	pDC->SelectObject(pOldFont);

	if (bDrawImages)
	{
		pImages->EndDrawImage(ds);
	}

	CMFCVisualManager::GetInstance()->SetFadeInactiveImage(bFadeInactiveImages);
}


void CA2ToolBox::DoDrawButton(CMFCToolBarButtonUP* pBtn, CDC* pDC, const CRect& rect, CMFCToolBarImages* pImages, BOOL bHorz, BOOL bCustomizeMode, BOOL bHighlight, BOOL bDrawBorder, BOOL bGrayDisabledButtons)
{
	ASSERT_VALID(pDC);
	ASSERT_VALID(this);

	pBtn->m_bHorz = bHorz;

	// Fill button interior:
	pBtn->FillInterior(pDC, rect, bHighlight);

	BOOL bHot = bHighlight;
	CSize sizeImage = (pImages == NULL) ? CSize(0, 0) : pImages->GetImageSize(TRUE);

	CUserTool* pUserTool = NULL;
	if (afxUserToolsManager != NULL && !pBtn->m_bUserButton)
	{
		pUserTool = afxUserToolsManager->FindTool(m_nID);
	}

	CRect rectInternal = rect;
	CSize sizeExtra = pBtn->m_bExtraSize ? CMFCVisualManager::GetInstance()->GetButtonExtraBorder() : CSize(0, 0);
	rectInternal.DeflateRect(sizeExtra.cx / 2, sizeExtra.cy / 2);

	int x = rectInternal.left;
	int y = rectInternal.top;

	int iTextLen = 0;

	CString strWithoutAmp = pBtn->m_strText;
	strWithoutAmp.Replace(_T("&&"), strDummyAmpSeq);
	strWithoutAmp.Remove(_T('&'));
	strWithoutAmp.Replace(strDummyAmpSeq, _T("&"));

	CSize sizeText = pDC->GetTextExtent(strWithoutAmp);

	if (pBtn->IsDrawText() && !(pBtn->m_bTextBelow && bHorz))
	{
		int nMargin = pBtn->IsDrawImage() ? 0 : nTextMargin;
		iTextLen = sizeText.cx + nMargin;
	}

	int dx = 0;
	int dy = 0;

	if (pBtn->m_bTextBelow && bHorz)
	{
		ASSERT(bHorz);

		dx = rectInternal.Width();
		dy = sizeImage.cy + 2 * nTextMargin;
	}
	else
	{
		dx = bHorz ? rectInternal.Width() - iTextLen : rectInternal.Width();
		dy = bHorz ? rectInternal.Height() : rectInternal.Height() - iTextLen;
	}

	// determine offset of bitmap(centered within button)
	CPoint ptImageOffset;
	ptImageOffset.x = 4; // (dx - sizeImage.cx) / 2;%%%
	ptImageOffset.y = (dy - sizeImage.cy) / 2;

	CPoint ptTextOffset(nTextMargin, nTextMargin);

	if (pBtn->IsDrawText() && !(pBtn->m_bTextBelow && bHorz))
	{
		TEXTMETRIC tm;
		pDC->GetTextMetrics(&tm);

		if (bHorz)
		{
			ptImageOffset.x -= nTextMargin;
			ptTextOffset.y = (dy - tm.tmHeight - 1) / 2;
		}
		else
		{
			ptImageOffset.y -= nTextMargin;
			ptTextOffset.x = (dx - tm.tmHeight + 1) / 2;
		}
	}

	CPoint ptImageOffsetInButton(0, 0);
	BOOL bPressed = FALSE;

	BOOL bDrawImageShadow = bHighlight && !bCustomizeMode && !pBtn->IsDroppedDown() && CMFCVisualManager::GetInstance()->IsShadowHighlightedImage() && \
		!afxGlobalData.IsHighContrastMode() && ((pBtn->m_nStyle & TBBS_PRESSED) == 0) && ((pBtn->m_nStyle & TBBS_CHECKED) == 0) && ((pBtn->m_nStyle & TBBS_DISABLED) == 0);

	if ((pBtn->m_nStyle &(TBBS_PRESSED | TBBS_CHECKED)) && !bCustomizeMode &&
		!CMFCVisualManager::GetInstance()->IsShadowHighlightedImage() && CMFCVisualManager::GetInstance()->IsOffsetPressedButton())
	{
		// pressed in or checked
		ptImageOffset.Offset(1, 1);
		bPressed = TRUE;

		ptTextOffset.y++;

		if (bHorz)
		{
			ptTextOffset.x++;
		}
		else
		{
			ptTextOffset.x--;
		}
	}

	BOOL bFadeImage = !bHighlight && CMFCVisualManager::GetInstance()->IsFadeInactiveImage();
	BOOL bImageIsReady = FALSE;

	if ((pBtn->m_nStyle & TBBS_PRESSED) || !(pBtn->m_nStyle & TBBS_DISABLED) || bCustomizeMode)
	{
		if (pBtn->IsDrawImage() && pImages != NULL)
		{
			if (pUserTool != NULL)
			{
				pUserTool->DrawToolIcon(pDC, CRect(CPoint(x + ptImageOffset.x, y + ptImageOffset.y), sizeImage));
			}
			else
			{
				CPoint pt = ptImageOffset;

				if (bDrawImageShadow)
				{
					pt.Offset(1, 1);

					pImages->Draw(pDC, x + pt.x, y + pt.y, pBtn->GetImage(), FALSE, FALSE, FALSE, TRUE);
					pt.Offset(-2, -2);
				}

				pImages->Draw(pDC, x + pt.x, y + pt.y, pBtn->GetImage(), FALSE, FALSE, FALSE, FALSE, bFadeImage);
			}
		}

		bImageIsReady = TRUE;
	}

	BOOL bDisabled = (bCustomizeMode && !pBtn->IsEditable()) || (!bCustomizeMode && (pBtn->m_nStyle & TBBS_DISABLED));

	if (!bImageIsReady)
	{
		if (pBtn->IsDrawImage() && pImages != NULL)
		{
			if (pUserTool != NULL)
			{
				pUserTool->DrawToolIcon(pDC, CRect(CPoint(x + ptImageOffset.x, y + ptImageOffset.y), sizeImage));
			}
			else
			{
				if (bDrawImageShadow)
				{
					ptImageOffset.Offset(1, 1);

					pImages->Draw(pDC, x + ptImageOffset.x, y + ptImageOffset.y, pBtn->GetImage(), FALSE, FALSE, FALSE, TRUE);
					ptImageOffset.Offset(-2, -2);
				}

				pImages->Draw(pDC, x + ptImageOffset.x, y + ptImageOffset.y, pBtn->GetImage(), FALSE, bDisabled && bGrayDisabledButtons, FALSE, FALSE, bFadeImage);
			}
		}
	}

	if ((pBtn->m_bTextBelow && bHorz) || pBtn->IsDrawText())
	{
		// Draw button's text:
		CMFCVisualManager::AFX_BUTTON_STATE state = CMFCVisualManager::ButtonsIsRegular;

		if (bHighlight)
		{
			state = CMFCVisualManager::ButtonsIsHighlighted;
		}
		else if (pBtn->m_nStyle &(TBBS_PRESSED | TBBS_CHECKED))
		{
			// Pressed in or checked:
			state = CMFCVisualManager::ButtonsIsPressed;
		}

		COLORREF clrText = CMFCVisualManager::GetInstance()->GetToolbarButtonTextColor(pBtn, state);

		pDC->SetTextColor(clrText);
		CString strText = pBtn->m_strText;
		CRect rectText = rectInternal;
		UINT uiTextFormat = 0;

		if (pBtn->m_bTextBelow && bHorz)
		{
			ASSERT(bHorz);

			ptTextOffset.y += sizeImage.cy + nTextMargin;
			uiTextFormat = DT_CENTER;

			if (pBtn->m_bWrapText)
			{
				uiTextFormat |= DT_WORDBREAK;
			}

			rectText.left = (rectInternal.left + rectInternal.right - pBtn->m_sizeText.cx) / 2 + ptTextOffset.x;
			rectText.right = (rectInternal.left + rectInternal.right + pBtn->m_sizeText.cx) / 2;
		}
		else
		{
			if (pBtn->IsDrawImage())
			{
				const int nExtra = CMFCToolBar::IsLargeIcons() ? 2 * nTextMargin : 0;

				if (bHorz)
				{
					ptTextOffset.x += sizeImage.cx + nExtra;
				}
				else
				{
					ptTextOffset.y += sizeImage.cy + nExtra;
				}

				rectText.left = x + ptTextOffset.x + nTextMargin;
			}
			else
			{
				rectText.left = x + nTextMargin + 1;
			}

			uiTextFormat = DT_SINGLELINE | DT_END_ELLIPSIS;
		}

		if (bHorz)
		{
			rectText.top += ptTextOffset.y;

			if (pBtn->m_bTextBelow && pBtn->m_bExtraSize)
			{
				rectText.OffsetRect(0, CMFCVisualManager::GetInstance()->GetButtonExtraBorder().cy / 2);
			}

			rectText.left += 4; // %%%
			pDC->DrawText(strWithoutAmp, &rectText, uiTextFormat);
		}
		else
		{
			rectText = rectInternal;
			rectText.top += ptTextOffset.y;

			rectText.left = rectText.CenterPoint().x - sizeText.cy / 2;
			rectText.right = rectText.left + sizeText.cy;
			rectText.top += max(0, (rectText.Height() - sizeText.cx) / 2);

			rectText.SwapLeftRight();

			uiTextFormat = DT_NOCLIP | DT_SINGLELINE;

			strText.Replace(_T("&&"), strDummyAmpSeq);
			int iAmpIndex = strText.Find(_T('&')); // Find a SINGLE '&'
			strText.Remove(_T('&'));
			strText.Replace(strDummyAmpSeq, _T("&&"));

			if (iAmpIndex >= 0)
			{
				// Calculate underlined character position:
				CRect rectSubText;
				rectSubText.SetRectEmpty();
				CString strSubText = strText.Left(iAmpIndex + 1);

				pDC->DrawText(strSubText, &rectSubText, uiTextFormat | DT_CALCRECT);
				int y1 = rectSubText.right;

				rectSubText.SetRectEmpty();
				strSubText = strText.Left(iAmpIndex);

				pDC->DrawText(strSubText, &rectSubText, uiTextFormat | DT_CALCRECT);
				int y2 = rectSubText.right;

				pDC->DrawText(strWithoutAmp, &rectText, uiTextFormat);

				int xAmp = rect.CenterPoint().x - sizeText.cy / 2;

				CPen* pOldPen = NULL;
				CPen pen(PS_SOLID, 1, pDC->GetTextColor());

				if (pDC->GetTextColor() != 0)
				{
					pOldPen = pDC->SelectObject(&pen);
				}

				pDC->MoveTo(xAmp, rectText.top + y1);
				pDC->LineTo(xAmp, rectText.top + y2);

				if (pOldPen != NULL)
				{
					pDC->SelectObject(pOldPen);
				}
			}
			else
			{
				pDC->DrawText(strWithoutAmp, &rectText, uiTextFormat);
			}
		}
	}

	// Draw button border:
	if (!bCustomizeMode && pBtn->HaveHotBorder() && bDrawBorder)
	{
		if (pBtn->m_nStyle &(TBBS_PRESSED | TBBS_CHECKED))
		{
			// Pressed in or checked:
			CMFCVisualManager::GetInstance()->OnDrawButtonBorder(pDC, pBtn, rect, CMFCVisualManager::ButtonsIsPressed);
		}
		else if (bHot && !(pBtn->m_nStyle & TBBS_DISABLED) && !(pBtn->m_nStyle &(TBBS_CHECKED | TBBS_INDETERMINATE)))
		{
			CMFCVisualManager::GetInstance()->OnDrawButtonBorder(pDC, pBtn, rect, CMFCVisualManager::ButtonsIsHighlighted);
		}
	}
}

// afx_msg
LRESULT CA2ToolBoxPane::OnWmiFillProps(WPARAM wParam, LPARAM lParam)
{
	if (wParam != WMI_FILL_PROPS_WPARAM)
		return 0L;
	return (LRESULT) WMI_FILL_PROPS_RESULT_SKIP;
}

CA2ToolBoxPane::CA2ToolBoxPane()
{
	m_wndToolBox.SetShowOnList(FALSE);
}

// virtual 
CA2ToolBoxPane::~CA2ToolBoxPane()
{

}

BEGIN_MESSAGE_MAP(CA2ToolBoxPane, CA2DockablePane)
	ON_MESSAGE(WMI_FILL_PROPS, OnWmiFillProps)
	ON_WM_CREATE()
	ON_WM_SIZE()
	ON_WM_SETFOCUS()
END_MESSAGE_MAP()

// afx_msg
void CA2ToolBoxPane::OnSetFocus(CWnd* pOldWnd)
{
	// не нужно ставить на ToolBar!
	__super::OnSetFocus(pOldWnd);
}

void CA2ToolBoxPane::SetToolBarBtnText(UINT nBtnIndex, LPCTSTR szText /*= NULL*/)
{
	m_wndToolBox.SetToolBarBtnText(nBtnIndex, szText, TRUE, TRUE);
}

void CA2ToolBoxPane::SetToolBarBtnTextID(UINT nID, LPCTSTR szText /*= NULL*/)
{
	int x = m_wndToolBox.CommandToIndex(nID);
	ATLASSERT(x >= 0);
	m_wndToolBox.SetToolBarBtnText(x, szText, TRUE, TRUE);
}

// afx_msg 
void CA2ToolBoxPane::OnSize(UINT nType, int cx, int cy)
{
	__super::OnSize(nType, cx, cy);
	if (!m_wndToolBox.GetSafeHwnd())
		return;
	CRect rectClient;
	GetClientRect(rectClient);
	AdjustBorder(rectClient);

	m_wndToolBox.SetWidth(rectClient.Width());
	m_wndToolBox.SetWindowPos(NULL, rectClient.left, rectClient.top, rectClient.Width(), rectClient.Height(), SWP_NOACTIVATE | SWP_NOZORDER);
	m_wndToolBox.AdjustSizeImmediate();
	m_wndToolBox.AdjustLocations();
}

// afx_msg 
int CA2ToolBoxPane::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;

	CRect rectDummy(0, 0, 0, 0);

	DWORD dwStyle =
		WS_CHILD | WS_VISIBLE | CBRS_TOP | CBRS_GRIPPER | CBRS_TOOLTIPS | CBRS_FLYBY | CBRS_SIZE_DYNAMIC;
	if (!m_wndToolBox.CreateEx(this, TBSTYLE_FLAT, dwStyle)) {
		ATLTRACE(L"Failed to create toolbox\n");
		return -1;      // fail to create
	}
	return 0;
}

// virtual 
void CA2ToolBoxPane::OnUpdateCmdUI(CFrameWnd* pTarget, BOOL bDisableIfNoHndler)
{
	__super::OnUpdateCmdUI(pTarget, bDisableIfNoHndler);
	if (!IsWindowVisible())
		return;
	CMDIFrameWndEx* pFrame = reinterpret_cast<CMDIFrameWndEx*>(AfxGetMainWnd());
	if (!pFrame)
		return;
	BOOL bMax = FALSE;
	CMDIChildWnd* pChildWnd = pFrame->MDIGetActive(&bMax);
	UINT nID = 0;
	if (pChildWnd) {
		CView* pView = pChildWnd->GetActiveView();
		LPARAM lParam = reinterpret_cast<LPARAM>(&nID);
		LRESULT lResult = pView->SendMessage(WMI_FILL_TOOLBOX, WMI_FILL_TOOLBOX_WPARAM, lParam);
		if (!lResult)
			nID = 0;
	}
	FillToolbox(nID);
}

void CA2ToolBoxPane::FillToolbox(UINT nID)
{
	if (nID == m_nID)
		return;
	m_nID = nID;
	m_wndToolBox.RemoveAllButtons();
	if (m_nID != 0) {
		m_wndToolBox.LoadToolBar(nID);
		CString strText;
		for (int i = 0; i < m_wndToolBox.GetCount(); i++) {
			CMFCToolBarButton* pBtn = m_wndToolBox.GetButton(i);
			if (pBtn->m_nStyle & TBBS_SEPARATOR)
				continue;
			strText.LoadString(pBtn->m_nID);
			SetToolBarBtnText(i, strText);
		}
	}
	m_wndToolBox.AdjustSizeImmediate();
	m_wndToolBox.AdjustLocations();
	m_wndToolBox.Invalidate();
}