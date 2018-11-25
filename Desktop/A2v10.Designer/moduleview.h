// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

#pragma once

class CModuleDoc;

class CModuleView : public CJsEditView
{
	int m_nCurrentLineHandle;
	CModuleView();
	virtual ~CModuleView();
public:
	DECLARE_DYNCREATE(CModuleView)
protected:
	void RemoveCurrentLineMarker();
	CModuleDoc* GetDocument() const
	{
		ASSERT(this != NULL); return reinterpret_cast<CModuleDoc*>(m_pDocument);
	}

	DECLARE_MESSAGE_MAP()

	afx_msg void OnDebugRun();
	afx_msg void OnDebugRunInt();
	afx_msg void OnDebugStepInto();
	afx_msg void OnDebugStepOver();
	afx_msg void OnDebugStepOut();
	afx_msg LRESULT OnWmiDebugBreak(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnWmiFillProps(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnChangeDebugMode(WPARAM wParam, LPARAM lParam);
};