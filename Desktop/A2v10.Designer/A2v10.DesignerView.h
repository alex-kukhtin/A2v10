
// A2v10.DesignerView.h : interface of the CA2v10DesignerView class
//

#pragma once


class CA2v10DesignerView : public CView
{
protected: // create from serialization only
	CA2v10DesignerView();
	DECLARE_DYNCREATE(CA2v10DesignerView)

// Attributes
public:
	CA2v10DesignerDoc* GetDocument() const;

// Operations
public:

// Overrides
public:
	virtual void OnDraw(CDC* pDC);  // overridden to draw this view
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);
protected:
	virtual BOOL OnPreparePrinting(CPrintInfo* pInfo);
	virtual void OnBeginPrinting(CDC* pDC, CPrintInfo* pInfo);
	virtual void OnEndPrinting(CDC* pDC, CPrintInfo* pInfo);

// Implementation
public:
	virtual ~CA2v10DesignerView();
#ifdef _DEBUG
	virtual void AssertValid() const;
	virtual void Dump(CDumpContext& dc) const;
#endif

protected:

// Generated message map functions
protected:
	afx_msg void OnFilePrintPreview();
	afx_msg void OnRButtonUp(UINT nFlags, CPoint point);
	afx_msg void OnContextMenu(CWnd* pWnd, CPoint point);
	DECLARE_MESSAGE_MAP()
};

#ifndef _DEBUG  // debug version in A2v10.DesignerView.cpp
inline CA2v10DesignerDoc* CA2v10DesignerView::GetDocument() const
   { return reinterpret_cast<CA2v10DesignerDoc*>(m_pDocument); }
#endif

