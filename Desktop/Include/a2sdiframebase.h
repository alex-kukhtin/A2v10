// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#pragma once


#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CA2SDIFrameWndBase : public CFrameWndEx
{
	DECLARE_DYNCREATE(CA2SDIFrameWndBase)
protected:
	CA2SDIFrameWndBase();           // protected constructor used by dynamic creation
	virtual ~CA2SDIFrameWndBase();

	CA2GlowBorder m_glowBorder;
	CA2BorderPanes m_borderPanes;
	int m_nDelta8;
	DWORD m_dwIdleFlags;
public:

	BOOL CreateBorderPanes();
	void DockBorderPanes();

protected:
	virtual int GetCaptionHeight();

	virtual void AdjustDockingLayout(HDWP hdwp = NULL);
	virtual  BOOL OnCmdMsg(UINT nID, int nCode, void* pExtra, AFX_CMDHANDLERINFO* pHandlerInfo);

	DECLARE_MESSAGE_MAP()
	afx_msg LRESULT OnNcCalcSize(WPARAM wParam, LPARAM lParam);
	afx_msg void OnNcRButtonUp(UINT nHitTest, CPoint point);
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnWindowPosChanged(WINDOWPOS* lpwndpos);
	afx_msg LRESULT OnIdleUpdate(WPARAM wParam, LPARAM lParam);
	afx_msg BOOL OnEraseBkgnd(CDC* pDC);
	afx_msg void OnSettingChange(UINT uFlags, LPCTSTR lpszSection);
};

#undef AFX_DATA
#define AFX_DATA

