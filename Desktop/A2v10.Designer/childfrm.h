
// ChildFrm.h : interface of the CChildFrame class
//

#pragma once

class CChildFrame : public CMDIChildWndEx
{
	DECLARE_DYNCREATE(CChildFrame)
public:
	CChildFrame();
	virtual ~CChildFrame() override;

protected:
	CSplitterWndEx m_wndSplitter;

public:
	virtual BOOL OnCreateClient(LPCREATESTRUCT lpcs, CCreateContext* pContext) override;
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs) override;
	virtual void OnUpdateFrameTitle(BOOL bAddToTitle) override;

public:
#ifdef _DEBUG
	virtual void AssertValid() const override;
	virtual void Dump(CDumpContext& dc) const override;
#endif

	// Generated message map functions
protected:
	BOOL IsOwnerDrawCaption2();
	void OnUpdateFrameTitle2(BOOL bAddToTitle);

	DECLARE_MESSAGE_MAP()

	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnClose();
};
