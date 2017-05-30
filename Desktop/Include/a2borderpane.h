#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CA2BorderPane : public CPane
{
	DECLARE_DYNAMIC(CA2BorderPane)
public:
	virtual AFX_DOCK_TYPE GetDockingMode() const { return DT_IMMEDIATE; }

protected:
	virtual BOOL CanFocus() const { return FALSE; }
	virtual BOOL IsResizable() const { return FALSE; }
	virtual BOOL DoesAllowDynInsertBefore() const { return FALSE; }
	virtual BOOL AllowShowOnPaneMenu() const { return FALSE; }
	virtual BOOL HideInPrintPreviewMode() const { return FALSE; }
	virtual BOOL CanFloat() const { return FALSE; }
	virtual BOOL CanBeResized() const { return FALSE; }
	virtual BOOL CanBeAttached() const { return FALSE; }
	virtual BOOL CanBeTabbedDocument() const { return FALSE; }
	virtual CSize CalcFixedLayout(BOOL bStretch, BOOL bHorz)
	{
		int gapSize = 4;
		return bHorz ? CSize(32767, gapSize) : CSize(gapSize, 32767);
	}

	virtual BOOL LoadState(LPCTSTR lpszProfileName = NULL, int nIndex = -1, UINT uiID = (UINT)-1)
		{ return TRUE; }
	virtual BOOL SaveState(LPCTSTR lpszProfileName = NULL, int nIndex = -1, UINT uiID = (UINT)-1)
		{ return TRUE; }
};


class CA2BorderPanes
{
	CA2BorderPane m_wndLeftGap;
	CA2BorderPane m_wndRightGap;
	CA2BorderPane m_wndTopGap;
	CA2BorderPane m_wndBottomGap;
public:
	BOOL Create(CWnd* pParent);
	void DockPanes(CMDIFrameWndEx* pFrame);
	void DockPanes(CFrameWndEx* pFrame);
};

#undef AFX_DATA
#define AFX_DATA
