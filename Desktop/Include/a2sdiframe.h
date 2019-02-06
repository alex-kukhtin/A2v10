// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#pragma once


#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CA2SDIFrameWnd : public CA2SDIFrameWndBase
{
	DECLARE_DYNCREATE(CA2SDIFrameWnd)
protected:
	CA2SDIFrameWnd();           // protected constructor used by dynamic creation
	virtual ~CA2SDIFrameWnd();

	CCaptionButtons m_captionButtons;

protected:

	virtual void RecalcLayout(BOOL bNotify = TRUE);

	DECLARE_MESSAGE_MAP()
	afx_msg void OnPaint();
	afx_msg LRESULT OnNcHitTest(WPARAM wParam, LPARAM lParam);
	afx_msg void OnNcLButtonDown(UINT nHitTest, CPoint point);
	afx_msg void OnNcMouseMove(UINT nHitTest, CPoint point);
	afx_msg void OnNcMouseLeave();
};

#undef AFX_DATA
#define AFX_DATA

