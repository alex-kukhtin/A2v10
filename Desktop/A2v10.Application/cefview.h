// Copyright © 2017-2020 Alex Kukhtin. All rights reserved.


#pragma once

class CCefView : public CView, public CCefClientHandler::Delegate
{
protected: // create from serialization only
	CCefView();
	DECLARE_DYNCREATE(CCefView)

	// Attributes
public:
	CWorkarea* GetDocument() const;

	// Overrides
public:
	virtual void OnDraw(CDC* pDC) override;  // overridden to draw this view
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs) override;
protected:
	virtual void OnInitialUpdate() override;

	// Implementation
public:
	virtual ~CCefView();
#ifdef _DEBUG
	virtual void AssertValid() const;
	virtual void Dump(CDumpContext& dc) const;
#endif

protected:
	void DoCloseBrowser();

	// Generated message map functions
protected:
	afx_msg void OnSize(UINT nType, int cx, int cy);
	afx_msg void OnFilePrintPreview();
	afx_msg void OnRButtonUp(UINT nFlags, CPoint point);
	afx_msg void OnContextMenu(CWnd* pWnd, CPoint point);
	afx_msg LRESULT OnAppCommand(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnCefTabCommand(WPARAM wParam, LPARAM lParam);
	afx_msg void OnNavigateBack();
	afx_msg void OnNavigateForward();
	afx_msg void OnClose();
	afx_msg void OnDestroy();
	afx_msg void OnSetFocus(CWnd* pOldWnd);

	DECLARE_MESSAGE_MAP()

	CefRefPtr<CefBrowser> m_browser;
	CefRefPtr<CCefClientHandler> m_clientHandler;

	//CCefClientHandler::Delegate
	virtual HWND OnBrowserCreated(CefRefPtr<CefBrowser> browser) override;
	virtual void OnBrowserClosed(CefRefPtr<CefBrowser> browser) override;
	virtual void OnBrowserClosing(CefRefPtr<CefBrowser> browser) override;
	virtual void OnBeforePopup(CefRefPtr<CefBrowser> browser, const wchar_t* url) override;

	// CefDisplayHandler::Deletage
	void CCefView::OnTitleChange(CefRefPtr<CefBrowser> browser, const wchar_t* title) override;

	afx_msg void OnReload();
	afx_msg void OnReloadIgnoreCache();
	afx_msg void OnShowDevTools();
	afx_msg LRESULT OnOpenCefView(WPARAM wParam, LPARAM lParam);
	afx_msg BOOL OnEraseBkgnd(CDC* pDC);
	afx_msg LRESULT OnIdleUpdateButtons(WPARAM wParam, LPARAM lParam);
};

#ifndef _DEBUG  // debug version in mainview.cpp
inline CWorkarea* CCefView::GetDocument() const
   { return reinterpret_cast<CWorkarea*>(m_pDocument); }
#endif

