// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#pragma once

class CMainFrame : public CA2SDIFrameWndBase
{
	
protected: // create from serialization only
	CMainFrame();
	DECLARE_DYNCREATE(CMainFrame)

	CCaptionButtons m_captionButtons;
	CCaptionNavigateButtons m_navigateButtons;

public:
	virtual ~CMainFrame() override;
	void CreateNewView();

	virtual BOOL PreCreateWindow(CREATESTRUCT& cs) override;
	virtual BOOL LoadFrame(UINT nIDResource, DWORD dwDefaultStyle = WS_OVERLAPPEDWINDOW | FWS_ADDTOTITLE, CWnd* pParentWnd = nullptr, CCreateContext* pContext = nullptr) override;
	virtual int GetCaptionHeight() override;

#ifdef _DEBUG
	virtual void AssertValid() const override;
	virtual void Dump(CDumpContext& dc) const override;
#endif

// Generated message map functions
protected:
	virtual void RecalcLayout(BOOL bNotify = TRUE) override;

	afx_msg LRESULT OnNcHitTest(WPARAM wParam, LPARAM lParam);
	afx_msg void OnPaint();
	afx_msg void OnNcLButtonDown(UINT nHitTest, CPoint point);
	afx_msg void OnNcMouseMove(UINT nHitTest, CPoint point);
	afx_msg void OnNcMouseLeave();

	afx_msg void OnSysCommand(UINT nID, LPARAM lParam);
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnFileClose();
	DECLARE_MESSAGE_MAP()
};


