// Copyright © 2008-2019 Alex Kukhtin. All rights reserved.

#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA


class CUITools
{
private:
	CUITools(void); // declaration only
	~CUITools(void);
public:
	static void TrackPopupMenu(UINT nMenu, int nSubMenu, CWnd* pWnd, CPoint point, bool alignRight = false);
	static CString GetMonospaceFontFamily();
	static BOOL TryDoCmdMsg(UINT nID, int nCode, void* pExtra, AFX_CMDHANDLERINFO* pHandlerInfo);
};

#undef AFX_DATA
#define AFX_DATA
