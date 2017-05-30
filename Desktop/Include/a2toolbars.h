#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA


class CA2MFCToolBar : public CMFCToolBar
{
	BOOL m_bAllowShowOnList;
	BOOL m_bUpdateCmdUiByOwner;
public:
	CA2MFCToolBar()
		: m_bAllowShowOnList(FALSE), m_bUpdateCmdUiByOwner(FALSE)
	{
	}

	virtual void OnUpdateCmdUI(CFrameWnd* pTarget, BOOL bDisableIfNoHndler);

	virtual BOOL OnBeforeFloat(CRect& /*rectFloat*/, AFX_DOCK_METHOD /*dockMethod*/)
		{ return FALSE; }

	virtual BOOL LoadState(LPCTSTR lpszProfileName = NULL, int nIndex = -1, UINT uiID = (UINT)-1)
		{	return FALSE; }

	virtual BOOL SaveState(LPCTSTR lpszProfileName = NULL, int nIndex = -1, UINT uiID = (UINT)-1)
	{
		return TRUE;
	}

	virtual BOOL AllowShowOnList() const { return m_bAllowShowOnList; }

	void SetShowOnList(BOOL bSet) { m_bAllowShowOnList = bSet; }
	void SetUpdateCmdUIByOwner(BOOL bSet) { m_bUpdateCmdUiByOwner = bSet; }
};


class CA2MFCMenuBar : public CMFCMenuBar
{
public:
	CA2MFCMenuBar()
	{
	}

	virtual BOOL OnBeforeFloat(CRect& /*rectFloat*/, AFX_DOCK_METHOD /*dockMethod*/)
	{
		return FALSE;
	}

	virtual BOOL LoadState(LPCTSTR lpszProfileName = NULL, int nIndex = -1, UINT uiID = (UINT)-1)
	{
		return TRUE;
	}

	virtual BOOL SaveState(LPCTSTR lpszProfileName = NULL, int nIndex = -1, UINT uiID = (UINT)-1)
	{
		return TRUE;
	}
	virtual int GetRowHeight() const;
};

class CA2MFCRibbonStatusBar : public CMFCRibbonStatusBar
{
public:
	CA2MFCRibbonStatusBar()
	{
	}


	virtual BOOL LoadState(LPCTSTR lpszProfileName = NULL, int nIndex = -1, UINT uiID = (UINT)-1)
	{
		return TRUE;
	}

	virtual BOOL SaveState(LPCTSTR lpszProfileName = NULL, int nIndex = -1, UINT uiID = (UINT)-1)
	{
		return TRUE;
	}
};

#undef AFX_DATA
#define AFX_DATA

