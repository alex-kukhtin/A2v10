
#pragma once

/////////////////////////////////////////////////////////////////////////////
// COutputList window

class COutputList : public CListBox
{
	// Construction
public:
	COutputList();

	// Implementation
public:
	virtual ~COutputList();

protected:
	afx_msg void OnContextMenu(CWnd* pWnd, CPoint point);
	afx_msg void OnEditCopy();
	afx_msg void OnEditClear();
	afx_msg void OnViewOutput();

	DECLARE_MESSAGE_MAP()
};

class CTraceList : public CMFCListCtrl
{
public:
	void Clear();

protected:
	afx_msg void OnContextMenu(CWnd* pWnd, CPoint point);
	afx_msg void OnEditCopy();
	afx_msg void OnEditClear();
	afx_msg void OnUpdateEditCopy(CCmdUI* pCmdUI);

	DECLARE_MESSAGE_MAP()
};

class COutputWnd : public CA2DockablePane
{
	//int m_nMessageWidth;

public:
	COutputWnd();

	void UpdateFonts();

	void Clear();
	void DoTrace(const TRACE_INFO& ti);

	// Attributes
protected:
	//CMFCTabCtrl	m_wndTabs;

	//COutputList m_wndOutputBuild;
	CTraceList m_wndOutputDebug;
	CA2MFCToolBar m_wndToolBar;

	//COutputList m_wndOutputFind;

protected:
	void FillBuildWindow();
	void FillDebugWindow();
	void FillFindWindow();

	void AdjustHorzScroll(CListBox& wndListBox);

	// Implementation
public:
	virtual ~COutputWnd();

protected:
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnSize(UINT nType, int cx, int cy);
	afx_msg void OnSettingChange(UINT uFlags, LPCWSTR lpszSection);

	DECLARE_MESSAGE_MAP()
};

