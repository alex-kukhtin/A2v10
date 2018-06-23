
#pragma once

class CSolutionTree : public CTreeCtrl
{
public:
	CSolutionTree()
		: m_hItemPropertyChanged(nullptr) {}

	HTREEITEM m_hItemPropertyChanged;
protected:
	DECLARE_MESSAGE_MAP()
	afx_msg LRESULT OnWmiFillProps(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnWmiPropertyChanged(WPARAM wParam, LPARAM lParam);
};

class CSolutionWnd : public CA2DockablePane
{
public:
	CSolutionWnd();
	virtual ~CSolutionWnd() override;

	void AdjustLayout();
	void OnChangeVisualStyle();

protected:
	CA2MFCToolBar m_wndToolBar;
	CSolutionTree m_wndTree;
	CImageList m_ClassViewImages;
	UINT m_nCurrSort;
	CString m_path;

	void LoadSolution(LPCWSTR path);
	void CloseSolution();
	void LoadSolutionImpl();
	void InsertCollection(JavaScriptValue& collection, HTREEITEM hRoot, int iImage, DWORD mask);
	void InsertDirectories(JavaScriptValue& collection, HTREEITEM hRoot, int iImage, DWORD mask);

// Overrides
public:
	virtual BOOL PreTranslateMessage(MSG* pMsg) override;

	void DoSave();
	void DoLoad();
	void DoCreate();
	void DoClose();
	bool IsLoaded();

protected:
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnSize(UINT nType, int cx, int cy);
	afx_msg void OnContextMenu(CWnd* pWnd, CPoint point);
	afx_msg void OnClassAddMemberFunction();
	afx_msg void OnClassAddMemberVariable();
	afx_msg void OnClassProperties();
	afx_msg void OnNewFolder();
	afx_msg void OnSetFocus(CWnd* pOldWnd);
	//afx_msg LRESULT OnChangeActiveTab(WPARAM, LPARAM);
	afx_msg void OnSort(UINT id);
	afx_msg void OnUpdateSort(CCmdUI* pCmdUI);
	afx_msg void OnAddTable();

	DECLARE_MESSAGE_MAP()
private:
	HTREEITEM m_hTables;
	HTREEITEM m_hViews;
	HTREEITEM m_hModels;
	
	void CreatePropertyIds();
	bool m_bPropsCreated;
	JavaScriptPropertyId m_namePropertyId;
	JavaScriptPropertyId m_columnsPropertyId;
	bool m_bLoaded;
	bool m_bModified;
	CString m_strFilePath;

	bool SaveSolution(LPCWSTR szJsonText);
};

