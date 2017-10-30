// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA


class CA2GlowWindow : public CWnd
{
	LRESULT m_htSide;
public:
	CA2GlowWindow()
		: m_htSide(HTNOWHERE) {}

	BOOL Create(CWnd* pParent, LRESULT Side);
	void Update();

protected:
	DECLARE_MESSAGE_MAP()
	afx_msg void OnPaint();
	afx_msg LRESULT OnNcHitTest(CPoint point);
	afx_msg void OnSysCommand(UINT nID, LPARAM lParam);
private:
	void DrawShadow(CSize size, DWORD* pBits);
};


class CA2GlowBorder
{
	CA2GlowWindow m_wndGlow[4];

public:
	CA2GlowBorder();
	virtual ~CA2GlowBorder();
	BOOL Create(CWnd* pParent);
	void Update();
	void Destroy();
	void OnWindowPosChanged(CWnd* pParent);
};


#undef AFX_DATA
#define AFX_DATA
