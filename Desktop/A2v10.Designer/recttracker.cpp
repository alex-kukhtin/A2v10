
#include "stdafx.h"

#include "recttracker.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#define IDB_HATCH 12112

CBrush CRectTrackerEx::m_brHatch;

CRectTrackerEx::CRectTrackerEx(LPCRECT lpSrcRect, UINT nStyle, bool bPartial /* = false */)
	: CRectTracker(lpSrcRect, nStyle),
	m_bPartial(bPartial)
{
	m_nHandleSize = CX_HANDLE_SIZE;
	m_dwDrawStyle = RTRE_ALL;
}

CRectTrackerEx::CRectTrackerEx(bool bPartial /*= false*/)
	: CRectTracker(), m_bPartial(bPartial)
{
	m_nHandleSize = CX_HANDLE_SIZE;
}

UINT CRectTrackerEx::GetHandleMask() const
{
	if (m_bPartial) {
		return (32 + 4 + 64);
	}
	else {
		return 0xFF;
	}
}

CBrush* CRectTrackerEx::GetHatchBrush()
{
	if ((HBRUSH)m_brHatch == NULL) {
		// create the hatch pattern + bitmap
		CBitmap bmp;
		bmp.LoadBitmap(IDB_HATCH);
		VERIFY(m_brHatch.CreatePatternBrush(&bmp));
	}
	m_brHatch.UnrealizeObject();
	return &m_brHatch;
}

BOOL CRectTrackerEx::SetCursorEx(CWnd* pWnd, UINT nHitTest) const
{
	if (nHitTest != HTCLIENT)
		return FALSE;
	CPoint point;
	GetCursorPos(&point);
	pWnd->ScreenToClient(&point);
	int nHandle = HitTestHandles(point);
	if (nHandle < 0)
		return FALSE;
	nHandle = NormalizeHit(nHandle);
	if (nHandle == hitMiddle)
		return FALSE;
	if ((GetDrawMask(nHandle) & m_dwDrawStyle) == 0)
		return FALSE;
	return CRectTracker::SetCursor(pWnd, nHitTest);
}

void CRectTrackerEx::DrawHatchBorder(CDC* pDC, CRect& rect)
{
	return;
	pDC->SetBkMode(OPAQUE);
	CRect rectTrue;
	GetTrueRect(&rectTrue);

	CBrush* pBrOld = pDC->SelectObject(GetHatchBrush());
	pDC->PatBlt(rectTrue.left, rectTrue.top, rectTrue.Width(),
		rect.top - rectTrue.top + 1, PATCOPY /* Pn */);
	pDC->PatBlt(rectTrue.left, rect.bottom - 1,
		rectTrue.Width(), rectTrue.bottom - rect.bottom + 1, PATCOPY /* Pn */);
	pDC->PatBlt(rectTrue.left, rect.top, rect.left - rectTrue.left + 1,
		rect.Height(), PATCOPY /* Pn */);
	pDC->PatBlt(rect.right - 1, rect.top, rectTrue.right - rect.right + 1,
		rect.Height(), PATCOPY /* Pn */);
	pDC->SelectObject(pBrOld);
}

void CRectTrackerEx::DrawItem(CDC* pDC, bool bOutline)
{
	// set initial DC state
	VERIFY(pDC->SaveDC() != 0);

	pDC->SetMapMode(MM_TEXT);
	pDC->SetWindowOrg(0, 0);
	pDC->SetViewportOrg(0, 0);


	// get normalized rectangle
	CRect rect(m_rect);
	rect.NormalizeRect();

	COLORREF clr = GetGlobalData()->clrHilite; //  RGB(255, 0, 255); // CTheme::GetRealColor(CTheme::ColorHighlight); // ::GetSysColor(COLOR_ACTIVECAPTION);
	CPen pen(PS_SOLID, 1, clr);
	CPen* oldPen = pDC->SelectObject(&pen);

	DrawHatchBorder(pDC, rect);

	pDC->SelectStockObject(WHITE_BRUSH);
	// draw resize handles
	if ((m_nStyle & (resizeInside | resizeOutside)) != 0) {
		for (int i = 0; i < 8; ++i) {
			GetHandleRect((TrackerHit)i, &rect);
			if (!bOutline && (m_dwDrawStyle & GetDrawMask(i)))
				pDC->FillSolidRect(rect, clr);
			else
				pDC->Rectangle(rect);
		}
	}
	// cleanup pDC state
	pDC->SelectObject(oldPen);
	VERIFY(pDC->RestoreDC(-1));
}

void CRectTrackerEx::DrawEx(CDC* pDC, bool bOutline)
{
	return;
	// set initial DC state
	VERIFY(pDC->SaveDC() != 0);

	// get normalized rectangle
	CRect rect(m_rect);
	rect.NormalizeRect();

	COLORREF clr = GetGlobalData()->clrHilite; // RGB(255, 0, 255); // CTheme::GetRealColor(CTheme::ColorHighlight); // ::GetSysColor(COLOR_ACTIVECAPTION);
	CPen pen(PS_SOLID, 1, clr);
	CPen* oldPen = pDC->SelectObject(&pen);

	DrawHatchBorder(pDC, rect);

	pDC->SelectStockObject(WHITE_BRUSH);
	// draw resize handles
	if ((m_nStyle & (resizeInside | resizeOutside)) != 0) {
		UINT mask = GetHandleMask();
		for (int i = 0; i < 8; ++i) {
			GetHandleRect((TrackerHit)i, &rect);
			if (!bOutline && (mask & (1 << i))) {
				pDC->FillSolidRect(rect, clr);
			}
			else {
				pDC->Rectangle(rect);
			}
		}
	}
	// cleanup pDC state
	pDC->SelectObject(oldPen);
	VERIFY(pDC->RestoreDC(-1));
}
