#pragma once

class CModuleView : public CJsEditView
{
	int m_nCurrentLineHandle;
	CModuleView();
	virtual ~CModuleView();
public:
	DECLARE_DYNCREATE(CModuleView)
protected:
	void RemoveCurrentLineMarker();
		
	DECLARE_MESSAGE_MAP()

	afx_msg void OnDebugRun();
	afx_msg void OnDebugRunInt();
	afx_msg void OnDebugStepInto();
	afx_msg void OnDebugStepOver();
	afx_msg void OnDebugStepOut();
	afx_msg LRESULT OnWmiDebugBreak(WPARAM wParam, LPARAM lParam);
};