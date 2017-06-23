#pragma once


#define MARKER_CURRENT_LINE 1

class CSciEditView : public CCtrlView
{
	DECLARE_DYNCREATE(CSciEditView)

	//CSciAutoCompletion* m_pAutoCompletion;
	//friend class CSciAutoCompletion;
	//friend class CXmlTagFinder;

public:
	CSciEditView();
	virtual ~CSciEditView();

	CString GetText();
	CStringA GetTextA();
	void SetText(LPCWSTR szText);
	void SetTextA(LPCSTR szText);
	void SetSavePoint();
	void SetReadOnly(bool bSet);

protected:
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);
	virtual void SetupEditor();
	virtual BOOL OnCmdMsg(UINT nID, int nCode, void* pExtra, AFX_CMDHANDLERINFO* pHandlerInfo);
	virtual void OnUpdate(CView* pSender, LPARAM lHint, CObject* pHint);

	virtual bool IsCLikeLang() { return false; }
	virtual bool IsHtmlLikeLang() { return false; }
	virtual int GetContextMenuPopupIndex() { return -1; }


	long GetLineLength(int line) const;
	void GetText(char* dst, Sci_PositionCR start, Sci_PositionCR end) const;
	int SearchInTarget(const char* text2Find, int lenOfText2Find, int fromPos, int toPos) const;

	long GetLineIndent(int line) const
	{
		return (long)SendMessage(SCI_GETLINEINDENTATION, line);
	}

	long GetCurrentPos() const
	{
		return (long) SendMessage(SCI_GETCURRENTPOS);
	}

	long GetCurrentDocLen() const
	{
		return (long) SendMessage(SCI_GETLENGTH);
	}

	void ClearIndicator(int indicatorNumber);

	DECLARE_MESSAGE_MAP()
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnEditCopy();
	afx_msg void OnEditCut();
	afx_msg void OnEditPaste();
	afx_msg void OnUpdateEditPaste(CCmdUI* pCmdUI);
	afx_msg void OnEditUndo();
	afx_msg void OnUpdateEditUndo(CCmdUI* pCmdUI);
	afx_msg void OnEditRedo();
	afx_msg void OnUpdateEditRedo(CCmdUI* pCmdUI);
	afx_msg void OnContextMenu(CWnd* pWnd, CPoint point);
	afx_msg void OnEditSelectAll();
	afx_msg void OnCharAdded(NMHDR* pNMHDR, LRESULT* pResult);
	afx_msg void OnUpdateUi(NMHDR* pNMHDR, LRESULT* pResult);
	afx_msg void OnSavePointLeft(NMHDR* pNMHDR, LRESULT* pResult);
};

class CJsEditView : public CSciEditView
{
	DECLARE_DYNCREATE(CJsEditView)
protected:
	virtual void SetupEditor();
	virtual bool IsCLikeLang() { return true; }
	virtual bool IsHtmlLikeLang() { return false; }
	virtual int GetContextMenuPopupIndex() { return IDM_POPUP_JSEDIT_INDEX; }
};

class CXamlEditView : public CSciEditView
{
	DECLARE_DYNCREATE(CXamlEditView)
protected:
	virtual void SetupEditor();
	virtual bool IsCLikeLang() { return false; }
	virtual bool IsHtmlLikeLang() { return true; }
	virtual int GetContextMenuPopupIndex() { return IDM_POPUP_XAMLEDIT_INDEX; }
};