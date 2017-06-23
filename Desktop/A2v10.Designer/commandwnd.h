#pragma once


class CA2CommandEdit : public CRichEditCtrl
{
protected:
	DECLARE_MESSAGE_MAP()

	afx_msg LRESULT OnWmiFillProps(WPARAM wParam, LPARAM lParam);
};

// CCommandWnd

class CCommandWnd : public CA2DockablePane
{
	CA2CommandEdit m_wndRichEdit;
	bool m_bSkipEnProtect;
	CArray<CString, LPCWSTR> m_cmdBuffer;
	int m_cmdBufferIndex;

public:
	CCommandWnd();
	virtual ~CCommandWnd();

protected:
	void AdjustLayout();
	virtual BOOL PreTranslateMessage(MSG* pMsg);

	void ProcessCurrentLine();
	BOOL IsLastLine(BOOL& bFirstChar);
	void ProcessHome();
	void ProcessNextCommand(bool bUp);
	void CheckCmdBufferSize();

	DECLARE_MESSAGE_MAP()

	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnSize(UINT nType, int cx, int cy);
	afx_msg void OnSetFocus(CWnd* pOldWnd);
	afx_msg void OnEnMsgFilter(NMHDR* pNMHDR, LRESULT* pResult);
	afx_msg void OnEnProtected(NMHDR* pNMHDR, LRESULT* pResult);
	afx_msg void OnContextMenu(CWnd* pWnd, CPoint point);
	afx_msg void OnEditCopy();
	afx_msg void OnUpdateEditCopy(CCmdUI* pCmdUI);
	afx_msg void OnEditCut();
	afx_msg void OnUpdateEditCut(CCmdUI* pCmdUI);
	afx_msg void OnEditPaste();
	afx_msg void OnUpdateEditPaste(CCmdUI* pCmdUI);
	afx_msg void OnEditClearAll();
	afx_msg void OnEditUndo();
	afx_msg void OnUpdateEditUndo(CCmdUI* pCmdUI);
	afx_msg void OnEditRedo();
	afx_msg void OnUpdateEditRedo(CCmdUI* pCmdUI);
};


