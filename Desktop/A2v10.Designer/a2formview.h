
#pragma once

class CA2FormDocument;
class CFormItem;

class CA2FormView : public CScrollView
{
protected: // create from serialization only
	CA2FormView();
	DECLARE_DYNCREATE(CA2FormView)

	// Attributes
public:
	CA2FormDocument* GetDocument() const;
	void ClientToDoc(CRect& rect);
	void ClientToDoc(CPoint& point);
	void DocToClient(CRect& rect);
	void DocToClient(CSize& size);


	void SelectItem(CFormItem* pItem, bool bAdd = false);

public:
	virtual void OnPrepareDC(CDC* pDC, CPrintInfo* pInfo = NULL) override;

protected:
	virtual void OnActivateView(BOOL bActivate, CView* pActivateView, CView* pDeactiveView) override;
	virtual void OnDraw(CDC* pDC) override;  // overridden to draw this view
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs) override;
	int GetContextMenuPopupIndex();

	virtual BOOL OnCmdMsg(UINT nID, int nCode, void* pExtra, AFX_CMDHANDLERINFO* pHandlerInfo) override;
	virtual BOOL OnPreparePrinting(CPrintInfo* pInfo) override;
	virtual void OnBeginPrinting(CDC* pDC, CPrintInfo* pInfo) override;
	virtual void OnEndPrinting(CDC* pDC, CPrintInfo* pInfo) override;
	virtual void OnUpdate(CView* pSender, LPARAM lHint, CObject* pHint) override;

	void SetDocumentSize();

	// Implementation
public:
	virtual ~CA2FormView();
#ifdef _DEBUG
	virtual void AssertValid() const override;
	virtual void Dump(CDumpContext& dc) const override;
#endif

protected:
	virtual void OnInitialUpdate() override; // called first time after construct
	virtual void OnPrepareDCEx(CDC* pDC, CPrintInfo* pInfo = NULL);

protected:
	bool TrackOutline(CPoint point);
	void DrawGrid(CDC* pDC);


	afx_msg void OnContextMenu(CWnd* pWnd, CPoint point);
	afx_msg void OnFilePrintPreview();
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg LRESULT OnWmiFillToolbox(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnWmiFillProps(WPARAM wParam, LPARAM lParam);
	afx_msg void OnTool(UINT nID);
	afx_msg void OnUpdateTool(CCmdUI* pCmdUI);
	afx_msg void OnLButtonDown(UINT nFlags, CPoint point);
	afx_msg BOOL OnEraseBkgnd(CDC* pDC);
	afx_msg BOOL OnSetCursor(CWnd* pWnd, UINT nHitTest, UINT message);
	afx_msg void OnEditClear();
	afx_msg void OnEditCut();
	afx_msg void OnEditCopy();
	afx_msg void OnEditPaste();
	afx_msg void OnUpdateSelected(CCmdUI* pCmdUI);
	afx_msg void OnUpdateEditPaste(CCmdUI* pCmdUI);

	DECLARE_MESSAGE_MAP()
};

#ifndef _DEBUG 
inline CA2FormDocument* CA2FormView::GetDocument() const
{
	return reinterpret_cast<CA2FormDocument*>(m_pDocument);
}
#endif

