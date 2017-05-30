
// MainFrm.h : interface of the CMainFrame class
//

#pragma once
#include "FileView.h"
#include "solutionwnd.h"
#include "outputwnd.h"
#include "propertieswnd.h"
#include "commandwnd.h"

class CMainFrame : public CA2MDIFrameWnd
{
	DECLARE_DYNAMIC(CMainFrame)
public:
	CMainFrame();

public:
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);

	virtual ~CMainFrame();
#ifdef _DEBUG
	virtual void AssertValid() const;
	virtual void Dump(CDumpContext& dc) const;
#endif

protected:  // control bar embedded members
	CA2MFCMenuBar       m_wndMenuBar;
	CA2MFCToolBar       m_wndToolBar;
	CA2ToolBoxPane      m_wndToolBox;
	CA2MFCRibbonStatusBar    m_wndStatusBar;
	CFileView         m_wndFileView;
	CSolutionWnd      m_wndSolution;
	COutputWnd        m_wndOutput;
	CPropertiesWnd    m_wndProperties;
	CCommandWnd       m_wndCommand;


protected:
	virtual BOOL CMainFrame::OnSetMenu(HMENU hmenu);

	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnWindowManager();
	afx_msg void OnViewCustomize();
	afx_msg void OnApplicationLook(UINT id);
	afx_msg void OnUpdateApplicationLook(CCmdUI* pCmdUI);
	afx_msg void OnViewOutputWindow();
	afx_msg void OnUpdateViewOutputWindow(CCmdUI* pCmdUI);
	afx_msg void OnSettingChange(UINT uFlags, LPCTSTR lpszSection);
	// 
	afx_msg LRESULT OnDebugMessage(WPARAM wParam, LPARAM lParam);
	afx_msg void OnViewProperties();
	afx_msg void OnViewToolbox();
	afx_msg void OnViewSolution();
	afx_msg void OnViewCommand();
	afx_msg void OnViewOutline();
	afx_msg void OnEnableAlways(CCmdUI* pCmdUI);
	afx_msg void OnHelpFinder();

	DECLARE_MESSAGE_MAP()

	BOOL CreateDockingWindows();
	void SetDockingWindowIcons(BOOL bHiColorIcons);
};


