
#pragma once

#include "ViewTree.h"

class CSolutionWnd : public CA2DockablePane
{
public:
	CSolutionWnd();
	virtual ~CSolutionWnd();

	void AdjustLayout();
	void OnChangeVisualStyle();

protected:
	CA2MFCToolBar m_wndToolBar;
	CViewTree m_wndClassView;
	CImageList m_ClassViewImages;
	UINT m_nCurrSort;

	void LoadSolution();
	void CloseSolution();

	//void InsertCollection(JavaScriptValue& collection, HTREEITEM hRoot, int iImage, DWORD mask);

// Overrides
public:
	virtual BOOL PreTranslateMessage(MSG* pMsg);


protected:
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnSize(UINT nType, int cx, int cy);
	afx_msg void OnContextMenu(CWnd* pWnd, CPoint point);
	afx_msg void OnClassAddMemberFunction();
	afx_msg void OnClassAddMemberVariable();
	afx_msg void OnClassDefinition();
	afx_msg void OnClassProperties();
	afx_msg void OnNewFolder();
	afx_msg void OnSetFocus(CWnd* pOldWnd);
	//afx_msg LRESULT OnChangeActiveTab(WPARAM, LPARAM);
	afx_msg void OnSort(UINT id);
	afx_msg void OnUpdateSort(CCmdUI* pCmdUI);
	afx_msg LRESULT OnWmiNotify(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnWmiPropertyChanged(WPARAM wParam, LPARAM lParam);

	DECLARE_MESSAGE_MAP()
};

