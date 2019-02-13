// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#pragma once

#define TAB_HEIGHT 32
#define TOP_GAP 4
#define LEFT_GAP 4
#define BOTTOM_GAP 6
#define SYSBTNS_HEIGHT 28

class CMainFrame : public CA2SDIFrameWndBase
{
	
protected: // create from serialization only
	CMainFrame();
	DECLARE_DYNCREATE(CMainFrame)

	CCaptionButtons m_captionButtons;
	CCaptionNavigateButtons m_navigateButtons;
	CNavTabs m_navigateTabs;
	UINT m_nViewId;

public:
	virtual ~CMainFrame() override;
	void CreateNewView(CEF_VIEW_INFO* pViewInfo);

	virtual BOOL PreCreateWindow(CREATESTRUCT& cs) override;
	virtual BOOL LoadFrame(UINT nIDResource, DWORD dwDefaultStyle = WS_OVERLAPPEDWINDOW | FWS_ADDTOTITLE, CWnd* pParentWnd = nullptr, CCreateContext* pContext = nullptr) override;
	virtual int GetCaptionHeight() override;

#ifdef _DEBUG
	virtual void AssertValid() const override;
	virtual void Dump(CDumpContext& dc) const override;
#endif

protected:
	virtual void RecalcLayout(BOOL bNotify = TRUE) override;
	void SwitchToTab(HWND targetHWnd);
	void CloseTab(HWND targetHWnd);

	afx_msg LRESULT OnNcHitTest(WPARAM wParam, LPARAM lParam);
	afx_msg void OnPaint();
	afx_msg void OnNcLButtonDown(UINT nHitTest, CPoint point);
	afx_msg void OnNcMouseMove(UINT nHitTest, CPoint point);
	afx_msg void OnNcMouseLeave();

	afx_msg void OnSysCommand(UINT nID, LPARAM lParam);
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnFileClose();
	afx_msg LRESULT OnCefViewCommand(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnCefTabCommand(WPARAM wParam, LPARAM lParam);
	afx_msg void OnUpdateSysMenu(CCmdUI* pCmdUI);
	afx_msg void OnAppTools();
	afx_msg void OnClose();
	afx_msg void OnDestroy();

	DECLARE_MESSAGE_MAP()
};


