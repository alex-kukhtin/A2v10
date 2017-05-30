#pragma once


#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA


class CCaptionButton
{
private:
	UINT m_nID;
	CRect m_rect;
	bool m_bHighlighted;
	bool m_bPressed;
public:
	CCaptionButton(UINT nID = 0)
		: m_nID(0), m_rect(0, 0, 0, 0),
		m_bHighlighted(false), m_bPressed(false) {}
	void SetID(UINT nID)
	{
		m_nID = nID;
	}
	void SetRect(const CRect rect)
	{
		m_rect = rect;
	}
	BOOL SetState(bool bHighlight, bool bPressed);
	BOOL SetHighlight(bool bSet);
	BOOL SetPress(bool bSet);
	const CRect& GetRect() { return m_rect; }

	void Draw(CDC* pDC);
	bool TrackButton(CWnd* pWnd, CPoint point);
	void ExecuteCommand(CWnd* pWnd);
};

class CCaptionButtons
{
	CCaptionButton m_buttons[4];
	int m_nWidth;
	CRect m_rect;
public:
	CCaptionButtons();
	void RecalcLayout(CRect clientRect, BOOL bZoomed);
	void Draw(CDC* pDC);
	BOOL PressButton(CPoint point, CWnd* pWnd);
	BOOL MouseMove(CPoint point);
	BOOL ClearHighlight();
	int Width() { return m_nWidth; }
	const CRect& GetRect() { return m_rect; }
};

#undef AFX_DATA
#define AFX_DATA
