#pragma once


#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CA2SDIFrameWnd : public CFrameWndEx
{
	DECLARE_DYNCREATE(CA2SDIFrameWnd)
protected:
	CA2SDIFrameWnd();           // protected constructor used by dynamic creation
	virtual ~CA2SDIFrameWnd();

	CA2GlowBorder m_glowBorder;
	CCaptionButtons m_captionButtons;
	CA2BorderPanes m_borderPanes;
	int m_nDelta8;
	DWORD m_dwIdleFlags;
public:

	BOOL CreateBorderPanes();
	void DockBorderPanes();

protected:
	int GetCaptionHeight();

	virtual void RecalcLayout(BOOL bNotify = TRUE);
	virtual void AdjustDockingLayout(HDWP hdwp = NULL);
	virtual  BOOL OnCmdMsg(UINT nID, int nCode, void* pExtra, AFX_CMDHANDLERINFO* pHandlerInfo);

	DECLARE_MESSAGE_MAP()
	afx_msg void OnPaint();
	afx_msg LRESULT OnNcHitTest(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnNcCalcSize(WPARAM wParam, LPARAM lParam);
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnWindowPosChanged(WINDOWPOS* lpwndpos);
	afx_msg void OnNcRButtonUp(UINT nHitTest, CPoint point);
	afx_msg void OnNcLButtonDown(UINT nHitTest, CPoint point);
	afx_msg void OnNcMouseMove(UINT nHitTest, CPoint point);
	afx_msg void OnNcMouseLeave();
	afx_msg LRESULT OnIdleUpdate(WPARAM wParam, LPARAM lParam);
	afx_msg BOOL OnEraseBkgnd(CDC* pDC);
	afx_msg void OnSettingChange(UINT uFlags, LPCTSTR lpszSection);
};

#undef AFX_DATA
#define AFX_DATA

