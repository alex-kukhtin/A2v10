#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CA2TabView : public CTabView
{
protected: // create from serialization only
	CA2TabView();
	DECLARE_DYNCREATE(CA2TabView)

public:
	virtual ~CA2TabView();

protected:
	virtual BOOL IsScrollBar() const;
	virtual void OnCreate();

	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnSize(UINT nType, int cx, int cy);

	DECLARE_MESSAGE_MAP()
};


#undef AFX_DATA
#define AFX_DATA
