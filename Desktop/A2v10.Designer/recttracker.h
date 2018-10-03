// Copyright © 2012-2018 Alex Kukhtin. All rights reserved.

#pragma once


#define CX_HANDLE_SIZE 6 

#define RTRE_TOPLEFT     0x00000001
#define RTRE_TOPRIGHT    0x00000002
#define RTRE_BOTTOMRIGHT 0x00000004
#define RTRE_BOTTOMLEFT  0x00000008
#define RTRE_TOP         0x00000010
#define RTRE_RIGHT       0x00000020
#define RTRE_BOTTOM      0x00000040
#define RTRE_LEFT        0x00000080
#define RTRE_MIDDLE      0x00000100
#define RTRE_ALL         0x000001FF

class CFormItem;

class CRectTrackerEx : public CRectTracker
{
	CFormItem* m_pItem;
	CDC* m_pDC;
	const POINT* m_pOffset;
public:
	CRectTrackerEx(LPCRECT lpSrcRect, UINT nStyle, CFormItem* pItem = nullptr, CDC* pDC = nullptr, const POINT* pPoint = nullptr, bool bPartial = false);
	CRectTrackerEx(bool bPartial = false);
	void DrawEx(CDC* pDC, bool bOutline);
	void DrawItem(CDC* pDC, bool bOutline);
	BOOL SetCursorEx(CWnd* pWnd, UINT nHitTest) const;
	DWORD GetDrawMask(int hit) const { return DWORD(1L << hit); }
	BOOL CanHitHandled(int hit) { return m_dwDrawStyle & GetDrawMask(hit); }

	virtual UINT GetHandleMask() const override;
	virtual void AdjustRect(int nHandle, LPRECT lpRect) override;

protected:
	bool m_bPartial;
	static CBrush m_brHatch;

	CBrush* GetHatchBrush();

	void DrawHatchBorder(CDC* pDC, CRect& rect);

public:
	DWORD m_dwDrawStyle;
};
