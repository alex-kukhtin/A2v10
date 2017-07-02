
#pragma once

#include "ViewTree.h"

class COutlineWnd : public CA2DockablePane
{
	CViewTree m_wndFileView;
	CImageList m_FileViewImages;
	CA2MFCToolBar m_wndToolBar;

public:
	COutlineWnd();
	virtual ~COutlineWnd() override;

	void AdjustLayout();
	void OnChangeVisualStyle();

protected:
	void FillFileView();

	DECLARE_MESSAGE_MAP()

	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnSize(UINT nType, int cx, int cy);
	afx_msg void OnContextMenu(CWnd* pWnd, CPoint point);
	afx_msg void OnProperties();
	afx_msg void OnFileOpen();
	afx_msg void OnFileOpenWith();
	afx_msg void OnEditCut();
	afx_msg void OnEditCopy();
	afx_msg void OnEditClear();
	afx_msg void OnSetFocus(CWnd* pOldWnd);
};

