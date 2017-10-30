// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CA2MiniFrameWnd : public CMultiPaneFrameWnd
{
	DECLARE_SERIAL(CA2MiniFrameWnd)
	CA2GlowBorder m_glowBorder;
public:
	CA2MiniFrameWnd();
	virtual ~CA2MiniFrameWnd();
	virtual void CalcBorderSize(CRect& rectBorderSize) const
	{
		rectBorderSize.SetRect(0, 0, 0, 0);
	}
protected:
	DECLARE_MESSAGE_MAP()

	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnWindowPosChanged(WINDOWPOS* lpwndpos);
	afx_msg void OnDestroy();
	afx_msg void OnNcPaint();
};

#undef AFX_DATA
#define AFX_DATA
