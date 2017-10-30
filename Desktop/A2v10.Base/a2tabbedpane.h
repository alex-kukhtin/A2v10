// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CA2TabbedPane : public CTabbedPane
{
	DECLARE_SERIAL(CA2TabbedPane)

public:
	CA2TabbedPane(BOOL bAutoDestroy = FALSE);
	virtual ~CA2TabbedPane();

protected:
	DECLARE_MESSAGE_MAP()

	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
};


#undef AFX_DATA
#define AFX_DATA

