// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

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
	void SetID(UINT nID) { m_nID = nID;}
	UINT GetID() const { return m_nID; }
	void SetRect(const CRect rect) { m_rect = rect;}
	BOOL SetState(bool bHighlight, bool bPressed);
	BOOL SetHighlight(bool bSet);
	BOOL SetPress(bool bSet);
	const CRect& GetRect() { return m_rect; }

	void Draw(CDC* pDC);
	bool TrackButton(CWnd* pWnd, CPoint point);
	void ExecuteCommand(CWnd* pWnd);
};

class CCaptionButtonsBase
{
protected:
	int m_nWidth;
	CRect m_rect;
	virtual int GetButtonsCount() = 0;
	virtual CCaptionButton* GetButton(int index) = 0;
public:
	CCaptionButtonsBase();
	BOOL ClearHighlight();
	void Draw(CDC* pDC);
	BOOL MouseMove(CPoint point);
	int Width() { return m_nWidth; }
	const CRect& GetRect() { return m_rect; }
	BOOL PressButton(CPoint point, CWnd* pWnd);
};

class CCaptionButtons : public CCaptionButtonsBase
{
	CCaptionButton m_buttons[4];
protected:
	virtual int GetButtonsCount() override { return _countof(m_buttons); }
	virtual CCaptionButton* GetButton(int index) override { return &m_buttons[index]; }

public:
	CCaptionButtons();
	void RecalcLayout(CRect clientRect, BOOL bZoomed);
};

class CCaptionNavigateButtons : public CCaptionButtonsBase
{
	CCaptionButton m_buttons[3];
protected:
	virtual int GetButtonsCount() override { return _countof(m_buttons); }
	virtual CCaptionButton* GetButton(int index) override { return &m_buttons[index]; }

public:
	CCaptionNavigateButtons();
	void RecalcLayout(CRect clientRect, BOOL bZoomed);
};

#undef AFX_DATA
#define AFX_DATA
