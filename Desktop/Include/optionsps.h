// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CBaseOptionPP : public CMFCPropertyPage
{
	UINT m_nCaption;
public:
	CBaseOptionPP(UINT nTemplateID, UINT nCaption)
		: CMFCPropertyPage(nTemplateID),
		m_nCaption(nCaption)
	{
	};
	UINT GetCaption() const
	{
		return m_nCaption;
	}
};

class CBasePropertySheet : public CMFCPropertySheet
{
public:
	CBasePropertySheet(UINT nID);
protected:
	virtual void OnDrawPageHeader(CDC* pDC, int nPage, CRect rectHeader);
};

class COptionsPropertySheet : public CBasePropertySheet
{
public:
	COptionsPropertySheet();

	enum {
		page_general = 0x0001,
		page_all = 0x00FF,
	};

	static void DoOptions(DWORD dwPages = page_all);
};

#undef AFX_DATA
#define AFX_DATA
