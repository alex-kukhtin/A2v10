// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.


#pragma once

class CDefaultView : public CView
{
protected: // create from serialization only
	CDefaultView();
	DECLARE_DYNCREATE(CDefaultView)


protected:
	virtual void OnDraw(CDC* pDC);
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);

	DECLARE_MESSAGE_MAP()

	afx_msg BOOL OnEraseBkgnd(CDC* pDC);
	afx_msg void OnStart();
};
