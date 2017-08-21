
// mainview.h : interface of the CCefView class
//

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
	virtual BOOL OnPreparePrinting(CPrintInfo* pInfo) override;
	virtual void OnBeginPrinting(CDC* pDC, CPrintInfo* pInfo) override;
	virtual void OnEndPrinting(CDC* pDC, CPrintInfo* pInfo) override;
	virtual void OnInitialUpdate() override;

// Implementation
public:
	virtual ~CCefView();
#ifdef _DEBUG
	virtual void AssertValid() const;
	virtual void Dump(CDumpContext& dc) const;
#endif

protected:

// Generated message map functions
protected:
	afx_msg void OnSize(UINT nType, int cx, int cy);
	afx_msg void OnFilePrintPreview();
	afx_msg void OnRButtonUp(UINT nFlags, CPoint point);
	afx_msg void OnContextMenu(CWnd* pWnd, CPoint point);
	DECLARE_MESSAGE_MAP()

	CefRefPtr<CCefClientHandler> m_clientHandler;
	CefRefPtr<CefBrowser> m_browser;

	//CCefClientHandler::Delegate
	virtual void OnBrowserCreated(CefRefPtr<CefBrowser> browser) override;
	virtual void OnBrowserClosed(CefRefPtr<CefBrowser> browser) override;
};

#ifndef _DEBUG  // debug version in mainview.cpp
inline CWorkarea* CCefView::GetDocument() const
   { return reinterpret_cast<CWorkarea*>(m_pDocument); }
#endif

