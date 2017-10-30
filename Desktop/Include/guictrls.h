// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CTitleCtrl : public CStatic
{
protected:
	DECLARE_MESSAGE_MAP();
	afx_msg void OnPaint();
};

class CInfoMsgCtrl : public CStatic
{
	TTI_TYPE m_type;
public:
	CInfoMsgCtrl()
		: m_type(_tti_warning) {}
	void SetType(TTI_TYPE tt)
	{
		m_type = tt;
	}
protected:
	DECLARE_MESSAGE_MAP();
	afx_msg void OnPaint();
};

#undef AFX_DATA
#define AFX_DATA
