#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CA2DockablePane : public CDockablePane
{
	DECLARE_SERIAL(CA2DockablePane)

public:
	CA2DockablePane();
	virtual ~CA2DockablePane();

protected:
	DECLARE_MESSAGE_MAP()

	void AdjustBorder(CRect& rectClient);

	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnPaint();
	afx_msg void OnSize(UINT nType, int cx, int cy);
	afx_msg BOOL OnEraseBkgnd(CDC* pDC);
};


#undef AFX_DATA
#define AFX_DATA
