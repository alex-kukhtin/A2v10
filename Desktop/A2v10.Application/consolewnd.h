
// Copyright © 2020 Alex Kukhtin. All rights reserved.

#pragma once


class CConsoleWnd : public CA2DockablePane
{
	CRichEditCtrl m_wndRichEdit;
	CA2MFCToolBar m_wndToolBar;

public:
	CConsoleWnd();
	virtual ~CConsoleWnd();

	enum ConsoleMsgType {
		Log = WMI_CONSOLE_LOG,
		Warn = WMI_CONSOLE_WARN,
		Info = WMI_CONSOLE_INFO,
		Error = WMI_CONSOLE_ERROR
	};

	void WriteToConsole(ConsoleMsgType type, LPCWSTR szMessage);

protected:
	void AdjustLayout();

	DECLARE_MESSAGE_MAP()

	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnSize(UINT nType, int cx, int cy);
	afx_msg void OnSetFocus(CWnd* pOldWnd);
	afx_msg void OnContextMenu(CWnd* pWnd, CPoint point);
	afx_msg void OnEditCopy();
	afx_msg void OnUpdateEditCopy(CCmdUI* pCmdUI);
	afx_msg void OnEditClearAll();
};
