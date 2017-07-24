#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CA2MDIFrameWnd : public CMDIFrameWndEx
{
	DECLARE_DYNCREATE(CA2MDIFrameWnd)
protected:
	CA2MDIFrameWnd();           // protected constructor used by dynamic creation
	virtual ~CA2MDIFrameWnd() override;

	CA2GlowBorder m_glowBorder;
	CCaptionButtons m_captionButtons;
	CA2BorderPanes m_borderPanes;
	int m_nDelta8;
	DWORD m_dwIdleFlags;
public:

	BOOL CreateBorderPanes();
	void DockBorderPanes();
	virtual void GetMessageString(UINT nID, CString& rMessage) const override;
	void UpdateTabs();

protected:
	int GetCaptionHeight();
	void EnableDefaultMDITabbedGroups();
	void UpdateMdiTabs();

	virtual void RecalcLayout(BOOL bNotify = TRUE) override;
	virtual void AdjustDockingLayout(HDWP hdwp = NULL) override;
	virtual  BOOL OnCmdMsg(UINT nID, int nCode, void* pExtra, AFX_CMDHANDLERINFO* pHandlerInfo) override;

	DECLARE_MESSAGE_MAP()
	afx_msg void OnPaint();
	afx_msg LRESULT OnNcHitTest(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnNcCalcSize(WPARAM wParam, LPARAM lParam);
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnWindowPosChanged(WINDOWPOS* lpwndpos);
	afx_msg LRESULT OnMoveToTabGroup(WPARAM wParam, LPARAM lParam);
	afx_msg void OnNcRButtonUp(UINT nHitTest, CPoint point);
	afx_msg void OnNcLButtonDown(UINT nHitTest, CPoint point);
	afx_msg void OnNcMouseMove(UINT nHitTest, CPoint point);
	afx_msg void OnNcMouseLeave();
	afx_msg LRESULT OnIdleUpdate(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnIdleUpdateCmdUI(WPARAM, LPARAM);
	afx_msg BOOL OnEraseBkgnd(CDC* pDC);
	afx_msg void OnSettingChange(UINT uFlags, LPCTSTR lpszSection);
	afx_msg LRESULT OnSetMessageString(WPARAM wParam, LPARAM lParam);
};

#undef AFX_DATA
#define AFX_DATA
