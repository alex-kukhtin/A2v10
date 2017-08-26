#pragma once


#include "outlinewnd.h"
#include "solutionwnd.h"
#include "outputwnd.h"
#include "propertieswnd.h"
#include "commandwnd.h"
#include "consolewnd.h"

class CMainFrame : public CA2MDIFrameWnd
{
	DECLARE_DYNAMIC(CMainFrame)
public:
	CMainFrame();
	virtual ~CMainFrame() override;

	virtual BOOL PreCreateWindow(CREATESTRUCT& cs) override;

#ifdef _DEBUG
	virtual void AssertValid() const override;
	virtual void Dump(CDumpContext& dc) const override;
#endif

protected:  // control bar embedded members
	CA2MFCMenuBar       m_wndMenuBar;
	CA2MFCToolBar       m_wndToolBar;
	CA2MFCToolBar       m_wndDebuggerToolBar;
	CA2ToolBoxPane      m_wndToolBox;
	CA2MFCRibbonStatusBar    m_wndStatusBar;
	COutlineWnd		  m_wndOutline;
	CSolutionWnd      m_wndSolution;
	COutputWnd        m_wndOutput;
	CPropertiesWnd    m_wndProperties;
	CCommandWnd       m_wndCommand;
	CConsoleWnd       m_wndConsole;


protected:
	virtual BOOL OnSetMenu(HMENU hmenu) override;

	CWnd* FindOrCreateCodeWindow(LPCWSTR szFileName);
	virtual void OnDebugModeChanged(bool bDebug) override;

	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnViewCustomize();
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
	afx_msg void OnViewConsole();
	afx_msg void OnEnableAlways(CCmdUI* pCmdUI);
	afx_msg void OnHelpFinder();
	afx_msg LRESULT OnWmiDebugBreak(WPARAM wParam, LPARAM lParam);
	afx_msg LRESULT OnWmiConsole(WPARAM wParam, LPARAM lParam);

	afx_msg void OnUpdateLineNo(CCmdUI* pCmdUI);
	afx_msg void OnSolutionSave();
	afx_msg void OnSolutionLoad();
	afx_msg void OnSolutionClose();
	afx_msg void OnSolutionNew();
	afx_msg void OnUpdateSolutionOpen(CCmdUI* pCmdUI);

	DECLARE_MESSAGE_MAP()

	BOOL CreateDockingWindows();
	void SetDockingWindowIcons();
};


