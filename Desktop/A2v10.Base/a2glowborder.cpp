#include "stdafx.h"

#include "../include/a2glowborder.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

BOOL CA2GlowWindow::Create(CWnd* pParent, LRESULT side)
{
	m_htSide = side;
	DWORD dwExStyle = WS_EX_TOOLWINDOW | WS_EX_LAYERED;
	DWORD dwStyle = WS_POPUP | WS_CLIPCHILDREN | WS_CLIPSIBLINGS;
	if (!CreateEx(dwExStyle,
		AfxRegisterWndClass(0, 0, HBRUSH(COLOR_WINDOW + 1), 0),
		L"A2Glow", dwStyle, CRect(0, 0, 0, 0), pParent, 0))
	{
		return FALSE;
	}
	SetOwner(pParent);
	return TRUE;
}

BEGIN_MESSAGE_MAP(CA2GlowWindow, CWnd)
	ON_WM_NCHITTEST()
	ON_WM_SYSCOMMAND()
END_MESSAGE_MAP()


void CA2GlowWindow::DrawShadow(CSize size, DWORD* pBits)
{

	BYTE hTable[4][8] =
	{
		{ 0xff, 0x30, 0x20, 0x10, 0x0c, 0x08, 0x04, 0x01 },
		{ 0x01, 0x04, 0x08, 0x0c, 0x10, 0x20, 0x30, 0xff }
	};

	BYTE hCorner[8][7] =
	{
		{ 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01 },
		{ 0x01, 0x01, 0x01, 0x01, 0x01, 0x04, 0x04 },
		{ 0x01, 0x01, 0x01, 0x01, 0x04, 0x08, 0x08 },
		{ 0x01, 0x01, 0x01, 0x04, 0x08, 0x0c, 0x0c },
		{ 0x01, 0x01, 0x04, 0x08, 0x0c, 0x0c, 0x10 },
		{ 0x01, 0x04, 0x08, 0x0c, 0x0c, 0x10, 0x10 },
		{ 0x01, 0x04, 0x08, 0x0c, 0x10, 0x10, 0x20 },

		{ 0x01, 0x04, 0x08, 0x0c, 0x10, 0x20, 0x20 }
	};

	int sIndex = 0;
	BYTE alpha;
	bool bHorz = true;

	switch (m_htSide) {
	case HTLEFT:	sIndex = 1; bHorz = false; break;
	case HTRIGHT:	sIndex = 0; bHorz = false; break;
	case HTTOP:		sIndex = 0; bHorz = true; break;
	case HTBOTTOM:	sIndex = 1; bHorz = true; break;
	}

	// aarrggbb /*aa = 255-opaque, 0-transparent*/
	/* if aa = 0, then no nchittest called. use 1 instead */

	if (bHorz) {
		DWORD* pBitsOrig = pBits;
		int cornerSize = size.cy;
		for (int r = 0; r < size.cy; r++) {
			for (int c = 0; c < size.cx; c++) {
				//*pBits = 0x01000000;
				alpha = hTable[sIndex][r];
				*pBits = (alpha << 24);
				pBits++;
			}
		}
		// left corner
		pBits = pBitsOrig;
		int bitIndex = 0;
		for (int r = 0; r < cornerSize; r++) {
			for (int c = 0; c < cornerSize - 1; c++) {
				bitIndex = r * size.cx + c;
				if (m_htSide == HTTOP)
					alpha = hCorner[cornerSize - r - 1][c];
				else
					alpha = hCorner[r][c];
				pBits[bitIndex] = (alpha << 24);
				//pBits[bitIndex] = 0x80ff0000;
			}
		}
		// right corner
		for (int r = 0; r < cornerSize; r++) {
			for (int c = 0; c < cornerSize - 1; c++) {
				bitIndex = (r + 1) * size.cx + c - cornerSize + 1;
				if (m_htSide == HTTOP)
					alpha = hCorner[cornerSize - r - 1][cornerSize - c - 2];
				else
					alpha = hCorner[r][cornerSize - c - 2];
				pBits[bitIndex] = (alpha << 24);
				//pBits[bitIndex] = 0x80ff0000;
			}
		}
	}
	else
	{
		for (int r = 0; r < size.cy; r++) {
			for (int c = 0; c < size.cx; c++) {
				//*pBits = 0x01000000;
				alpha = hTable[sIndex][c];
				*pBits = (alpha << 24);
				pBits++;
			}
		}
	}
}

void CA2GlowWindow::Update()
{
	CRect xr;
	GetClientRect(xr);

	CPoint point(0, 0);
	CSize size(xr.Width(), xr.Height());


	LPBYTE pBits = nullptr;
	HBITMAP hBitmap = CDrawingManager::CreateBitmap_32(size, (void**)&pBits);
	if (hBitmap == nullptr)
		return;

	CBitmap bitmap;
	bitmap.Attach(hBitmap);
	CClientDC clientDC(this);


	CDC dc;
	dc.CreateCompatibleDC(&clientDC);
	CBitmap* pBitmapOld = (CBitmap*)dc.SelectObject(&bitmap);
	DWORD* pDwBits = (DWORD*)pBits;
	DrawShadow(size, pDwBits);

	BLENDFUNCTION bf;
	bf.BlendOp = AC_SRC_OVER;
	bf.BlendFlags = 0;
	bf.SourceConstantAlpha = 255;
	bf.AlphaFormat = AC_SRC_ALPHA;

	UpdateLayeredWindow(NULL, 0, &size, &dc, &point, 0, &bf, ULW_ALPHA);

	dc.SelectObject(pBitmapOld);
}

// afx_msg 
LRESULT CA2GlowWindow::OnNcHitTest(CPoint point)
{
	if ((m_htSide == HTTOP) || (m_htSide == HTBOTTOM)) {
		CRect wr;
		GetWindowRect(&wr);
		int cornerSize = wr.Height();
		if (point.x < (wr.left + cornerSize))
			return (m_htSide == HTTOP) ? HTTOPLEFT : HTBOTTOMLEFT;
		else if (point.x >(wr.right - cornerSize))
			return (m_htSide == HTTOP) ? HTTOPRIGHT : HTBOTTOMRIGHT;
	}
	return m_htSide;
}

// afx_msg
void CA2GlowWindow::OnSysCommand(UINT nID, LPARAM lParam)
{
	CWnd* pWnd = GetOwner();
	if (!pWnd)
		return;
	pWnd->SetFocus();
	pWnd->SendMessage(WM_SYSCOMMAND, (WPARAM)nID, lParam);
}

CA2GlowBorder::CA2GlowBorder()
{
}


CA2GlowBorder::~CA2GlowBorder()
{
}

BOOL CA2GlowBorder::Create(CWnd* pParent)
{
	if (!m_wndGlow[0].Create(pParent, HTLEFT))
		return FALSE;
	if (!m_wndGlow[1].Create(pParent, HTTOP))
		return FALSE;
	if (!m_wndGlow[2].Create(pParent, HTRIGHT))
		return FALSE;
	if (!m_wndGlow[3].Create(pParent, HTBOTTOM))
		return FALSE;
	return TRUE;
}

void CA2GlowBorder::Update()
{

}

void CA2GlowBorder::OnWindowPosChanged(CWnd* pParent)
{
	if (!m_wndGlow[0].GetSafeHwnd())
		return;
	if ((pParent->GetStyle() & WS_MAXIMIZE) || !pParent->IsWindowVisible())
	{
		HDWP hDwp = ::BeginDeferWindowPos(4);
		for (int i = 0; i<4; i++)
			::DeferWindowPos(hDwp, m_wndGlow[i].GetSafeHwnd(), nullptr,
				0, 0, 0, 0, SWP_HIDEWINDOW | SWP_NOZORDER);
		EndDeferWindowPos(hDwp);
		return;
	}
	CRect wr;
	pParent->GetWindowRect(wr);
	HDWP hDwp = ::BeginDeferWindowPos(4);
	int glowSize = 8;
	DWORD dwFlags = SWP_SHOWWINDOW | SWP_NOZORDER | SWP_NOACTIVATE;
	::DeferWindowPos(hDwp, m_wndGlow[0].GetSafeHwnd(), nullptr,
		wr.left - glowSize, wr.top, glowSize, wr.Height(), dwFlags);
	::DeferWindowPos(hDwp, m_wndGlow[1].GetSafeHwnd(), nullptr,
		wr.left - glowSize, wr.top - glowSize, wr.Width() + glowSize * 2, glowSize, dwFlags);
	::DeferWindowPos(hDwp, m_wndGlow[2].GetSafeHwnd(), nullptr,
		wr.right, wr.top, glowSize, wr.Height(), dwFlags);
	::DeferWindowPos(hDwp, m_wndGlow[3].GetSafeHwnd(), nullptr,
		wr.left - glowSize, wr.bottom, wr.Width() + glowSize * 2, glowSize, dwFlags);
	EndDeferWindowPos(hDwp);
	for (int i = 0; i<4; i++)
		m_wndGlow[i].Update();
}

void CA2GlowBorder::Destroy()
{
	for (int i = 0; i < 4; i++)
	{
		m_wndGlow[i].DestroyWindow();
	}
}
