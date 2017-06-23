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
	afx_msg LRESULT OnWmiDebugBreak(WPARAM wParam, LPARAM lParam);
};