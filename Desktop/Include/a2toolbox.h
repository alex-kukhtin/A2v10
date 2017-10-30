// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA


class CMFCToolBarButtonUP;

class CA2ToolBox : public CA2MFCToolBar
{
	DECLARE_DYNAMIC(CA2ToolBox)

	int m_nWidth;
public:
	CA2ToolBox();
	virtual ~CA2ToolBox();

	void SetWidth(int nWidth)
	{
		m_nWidth = nWidth;
	}

	virtual void AdjustLocations();
protected:
	virtual CSize CalcFixedLayout(BOOL bStretch, BOOL bHorz);
	virtual BOOL DrawButton(CDC* pDC, CMFCToolBarButton* pButton, CMFCToolBarImages* pImages, BOOL bHighlighted, BOOL bDrawDisabledImages);
	virtual void DoPaint(CDC* pDC);
	void DoDrawButton(CMFCToolBarButtonUP* pBtn, CDC* pDC, const CRect& rect, CMFCToolBarImages* pImages, BOOL bHorz, BOOL bCustomizeMode, BOOL bHighlight, BOOL bDrawBorder, BOOL bGrayDisabledButtons);

	DECLARE_MESSAGE_MAP()

};


class CA2ToolBoxPane : public CA2DockablePane
{
	CA2ToolBox m_wndToolBox;

public:
	CA2ToolBoxPane();
	virtual ~CA2ToolBoxPane();
	void SetToolBarBtnText(UINT nBtnIndex, LPCTSTR szText = NULL);
	void SetToolBarBtnTextID(UINT nID, LPCTSTR szText = NULL);

protected:
	virtual BOOL CanBeAttached() const { return TRUE; }
	virtual BOOL HasAutoHideMode() const { return TRUE; }

	virtual void OnUpdateCmdUI(CFrameWnd* pTarget, BOOL bDisableIfNoHndler);

	void FillToolbox(UINT nID);

	DECLARE_MESSAGE_MAP()

	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnSize(UINT nType, int cx, int cy);
	afx_msg void OnSetFocus(CWnd* pOldWnd);
	afx_msg LRESULT OnWmiFillProps(WPARAM wParam, LPARAM lParam);
};


#undef AFX_DATA
#define AFX_DATA


