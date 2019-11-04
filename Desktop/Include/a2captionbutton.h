// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

#pragma once


#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA


class CCaptionButton
{
protected:
	UINT m_nID;
	CRect m_rect;
	bool m_bHighlighted;
	bool m_bPressed;
	bool m_bDisabled;
public:
	CCaptionButton(UINT nID = 0)
		: m_nID(0), m_rect(0, 0, 0, 0),
		m_bHighlighted(false), m_bPressed(false), m_bDisabled(false) {}
	void SetID(UINT nID) { m_nID = nID;}
	UINT GetID() const { return m_nID; }
	bool SetState(bool bHighlight, bool bPressed);
	bool SetHighlight(bool bSet);
	bool SetPress(bool bSet);
	bool SetDisabled(bool bSet);
	const CRect& GetRect() { return m_rect; }

	bool TrackButton(CWnd* pWnd, CPoint point);

	virtual void SetRect(const CRect rect);
	virtual void Draw(CDC* pDC);
	virtual void ExecuteCommand(CWnd* pWnd, CPoint point);
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

	bool ClearHighlight();
	virtual void Draw(CDC* pDC);
	bool MouseMove(CPoint point);
	int Width() { return m_nWidth; }
	const CRect& GetRect() { return m_rect; }
	bool PressButton(CPoint point, CWnd* pWnd);
};

class CCaptionButtons : public CCaptionButtonsBase
{
	CCaptionButton m_buttons[4];
protected:
	virtual int GetButtonsCount() override { return _countof(m_buttons); }
	virtual CCaptionButton* GetButton(int index) override { return &m_buttons[index]; }

public:
	CCaptionButtons(UINT nReplaceHelp = 0);
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
	bool DisableButton(int index, bool bDisable);
};

#undef AFX_DATA
#define AFX_DATA
