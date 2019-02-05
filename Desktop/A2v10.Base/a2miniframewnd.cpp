// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "..\include\a2glowborder.h"
#include "a2miniframewnd.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

CA2MiniFrameWnd::CA2MiniFrameWnd()
{
}


CA2MiniFrameWnd::~CA2MiniFrameWnd()
{
}

IMPLEMENT_SERIAL(CA2MiniFrameWnd, CMultiPaneFrameWnd, 0)

BEGIN_MESSAGE_MAP(CA2MiniFrameWnd, CMultiPaneFrameWnd)
	ON_WM_CREATE()
	ON_WM_WINDOWPOSCHANGED()
	ON_WM_DESTROY()
	ON_WM_NCPAINT()
END_MESSAGE_MAP()

// afx_msg
int CA2MiniFrameWnd::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;

	if (!m_glowBorder.Create(this))
		return -1;
	return 0;
}

// afx_msg 
void CA2MiniFrameWnd::OnWindowPosChanged(WINDOWPOS* lpwndpos)
{
	__super::OnWindowPosChanged(lpwndpos);
	m_glowBorder.OnWindowPosChanged(this);
	Invalidate();
}

// afx_msg
void CA2MiniFrameWnd::OnDestroy()
{
	m_glowBorder.Destroy();
	__super::OnDestroy();
}

// afx_msg
void CA2MiniFrameWnd::OnNcPaint()
{
	/* change font bold to regular */
	CDockingManager* pDockManager = m_pDockManager != NULL ? m_pDockManager : afxGlobalUtils.GetDockingManager(GetParent());
	if (pDockManager == NULL)
	{
		return;
	}

	ASSERT_VALID(pDockManager);

	if (pDockManager->m_bLockUpdate)
	{
		return;
	}

	CWindowDC dc(this); // device context for painting

	CDC* pDC = &dc;
	BOOL m_bMemDC = FALSE;
	CDC dcMem;
	CBitmap bmp;
	CBitmap* pOldBmp = NULL;

	CRect rectWindow;
	GetWindowRect(rectWindow);
	CRect rect;
	rect.SetRect(0, 0, rectWindow.Width(), rectWindow.Height());

	if (dcMem.CreateCompatibleDC(&dc) && bmp.CreateCompatibleBitmap(&dc, rect.Width(), rect.Height()))
	{
		// Off-screen DC successfully created. Better paint to it then!
		m_bMemDC = TRUE;
		pOldBmp = dcMem.SelectObject(&bmp);
		pDC = &dcMem;
	}

	// client area is not our bussiness :)
	CRect rcClient, rcBar;
	GetWindowRect(rcBar);

	GetClientRect(rcClient);
	ClientToScreen(rcClient);
	rcClient.OffsetRect(-rcBar.TopLeft());

	dc.ExcludeClipRect(rcClient);

	CRgn rgn;
	if (!m_rectRedraw.IsRectEmpty())
	{
		rgn.CreateRectRgnIndirect(m_rectRedraw);
		dc.SelectClipRgn(&rgn);
	}

	// draw border
	OnDrawBorder(pDC);

	CRect rectCaption;
	GetCaptionRect(rectCaption);

	pDockManager = m_pDockManager != NULL ? m_pDockManager : afxGlobalUtils.GetDockingManager(GetParent());
	ASSERT_VALID(pDockManager);
	if (pDockManager->m_bLockUpdate)
	{
		rectCaption.SetRectEmpty();
	}

	// draw caption:
	GetCaptionRect(rectCaption);

	COLORREF clrText = CMFCVisualManager::GetInstance()->OnFillMiniFrameCaption(pDC, rectCaption, this, m_bActive);

	int xBtnsLeft = -1;
	int xBtnsRight = -1;
	for (POSITION pos = m_lstCaptionButtons.GetHeadPosition(); pos != NULL;)
	{
		CMFCCaptionButton* pBtn = (CMFCCaptionButton*)m_lstCaptionButtons.GetNext(pos);
		ASSERT_VALID(pBtn);

		pBtn->m_clrForeground = clrText;

		if (!pBtn->m_bHidden)
		{
			if (pBtn->m_bLeftAlign)
			{
				if (xBtnsRight == -1)
				{
					xBtnsRight = pBtn->GetRect().right + 2;
				}
				else
				{
					xBtnsRight = max(xBtnsRight, pBtn->GetRect().right + 2);
				}
			}
			else
			{
				if (xBtnsLeft == -1)
				{
					xBtnsLeft = pBtn->GetRect().left;
				}
				else
				{
					xBtnsLeft = min(xBtnsLeft, pBtn->GetRect().left);
				}
			}
		}
	}

	// Paint caption text:
	pDC->SetBkMode(TRANSPARENT);
	pDC->SetTextColor(clrText);

	/***bold -> regular**/
	CFont* pOldFont = pDC->SelectObject(&(GetGlobalData()->fontRegular));
	ASSERT_VALID(pOldFont);

	CString strCaption = GetCaptionText();

	CRect rectText = rectCaption;
	rectText.left += 4; /****/
	if (xBtnsLeft != -1)
	{
		rectText.right = xBtnsLeft;
	}
	if (xBtnsRight != -1)
	{
		rectText.left = xBtnsRight;
	}

	rectText.DeflateRect(2, 0);

	pDC->DrawText(strCaption, rectText, DT_LEFT | DT_SINGLELINE | DT_VCENTER | DT_END_ELLIPSIS);

	pDC->SelectObject(pOldFont);
	pDC->SelectClipRgn(NULL);

	// Paint caption buttons:
	OnDrawCaptionButtons(pDC);

	if (m_bMemDC)
	{
		// Copy the results to the on-screen DC:
		CRect rectClip;
		int nClipType = dc.GetClipBox(rectClip);
		if (nClipType != NULLREGION)
		{
			if (nClipType != SIMPLEREGION)
			{
				rectClip = rect;
			}

			dc.BitBlt(rectClip.left, rectClip.top, rectClip.Width(), rectClip.Height(), &dcMem, rectClip.left, rectClip.top, SRCCOPY);
		}

		dcMem.SelectObject(pOldBmp);
	}

	CWnd::OnNcPaint();
}
