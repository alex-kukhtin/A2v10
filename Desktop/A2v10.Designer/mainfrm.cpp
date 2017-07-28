
// MainFrm.cpp : implementation of the CMainFrame class
//

#include "stdafx.h"
#include "A2v10.Designer.h"

#include "MainFrm.h"
#include "resource.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#define HELP_COMBO_WIDTH 250

#define HORZ_PANE_HEIGHT 175
#define VERT_PANE_WIDTH	 250

// CMainFrame

IMPLEMENT_DYNAMIC(CMainFrame, CA2MDIFrameWnd)

BEGIN_MESSAGE_MAP(CMainFrame, CA2MDIFrameWnd)
	ON_WM_CREATE()
	//ON_COMMAND(ID_VIEW_CUSTOMIZE, &CMainFrame::OnViewCustomize)
	/*
	Нельзя использовать команду показа панели для ее ID!
	Если это включить, то исчезают отметки в меню по правой кнопке.
	ON_COMMAND(ID_VIEW_OUTPUTWND, &CMainFrame::OnViewOutputWindow)
	ON_UPDATE_COMMAND_UI(ID_VIEW_OUTPUTWND, &CMainFrame::OnUpdateViewOutputWindow)
	*/
	ON_MESSAGE(WMI_DEBUG_BREAK, OnWmiDebugBreak)
	ON_MESSAGE(WMI_CONSOLE, OnWmiConsole)
	ON_WM_SETTINGCHANGE()
	ON_MESSAGE(WMIC_DEBUG_MSG, OnDebugMessage)
	ON_COMMAND(ID_VIEW_PROPERTIES, OnViewProperties)
	ON_UPDATE_COMMAND_UI(ID_VIEW_PROPERTIES, OnEnableAlways)
	ON_COMMAND(ID_VIEW_TOOLBOX, OnViewToolbox)
	ON_UPDATE_COMMAND_UI(ID_VIEW_TOOLBOX, OnEnableAlways)
	ON_COMMAND(ID_VIEW_COMMAND, OnViewCommand)
	ON_UPDATE_COMMAND_UI(ID_VIEW_COMMAND, OnEnableAlways)
	ON_COMMAND(ID_VIEW_SOLUTION, OnViewSolution)
	ON_UPDATE_COMMAND_UI(ID_VIEW_SOLUTION, OnEnableAlways)
	ON_COMMAND(ID_VIEW_OUTLINE, OnViewOutline)
	ON_UPDATE_COMMAND_UI(ID_VIEW_OUTLINE, OnEnableAlways)
	ON_COMMAND(ID_HELP_FINDER, OnHelpFinder)
	ON_COMMAND(ID_VIEW_CONSOLE, OnViewConsole)
	ON_UPDATE_COMMAND_UI(ID_VIEW_CONSOLE, OnEnableAlways)
	ON_UPDATE_COMMAND_UI(ID_INDICATOR_LNCOL, OnUpdateLineNo)
END_MESSAGE_MAP()

// CMainFrame construction/destruction

CMainFrame::CMainFrame()
{
	m_wndToolBar.SetShowOnList(TRUE);
}

CMainFrame::~CMainFrame()
{
}

int CMainFrame::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;

	m_wndMenuBar.EnableHelpCombobox(ID_HELP_FINDER, L"Help finder", HELP_COMBO_WIDTH);

	EnableDefaultMDITabbedGroups();


	if (!m_wndMenuBar.CreateEx(this))
	{
		TRACE0("Failed to create menubar\n");
		return -1;      // fail to create
	}

	m_wndMenuBar.SetPaneStyle(m_wndMenuBar.GetPaneStyle() | CBRS_TOOLTIPS | CBRS_FLYBY);

	if (!m_borderPanes.Create(this)) {
		TRACE0("Failed to create border panes\n");
		return -1;
	}

	// prevent the menu bar from taking the focus on activation
	CMFCPopupMenu::SetForceMenuFocus(FALSE);

	if (!m_wndToolBar.CreateEx(this,
		TBSTYLE_FLAT,
		WS_CHILD | WS_VISIBLE | CBRS_TOP | CBRS_TOOLTIPS | CBRS_FLYBY | CBRS_GRIPPER,
		CRect(0, 2, 0, 2)) ||
		!m_wndToolBar.LoadToolBar(IDR_MAINFRAME))
	{
		TRACE0("Failed to create toolbar\n");
		return -1;      // fail to create
	}

	CString strToolBarName;
	VERIFY(strToolBarName.LoadString(IDS_TOOLBAR_STANDARD));
	m_wndToolBar.SetWindowText(strToolBarName);

	CString strCustomize; // Empty string required.
	m_wndToolBar.EnableCustomizeButton(TRUE, 0, strCustomize);

	if (!m_wndStatusBar.Create(this))
	{
		TRACE0("Failed to create status bar\n");
		return -1;      // fail to create
	}
	//CMFCRibbonStatusBarPane* pPane = new CMFCRibbonStatusBarPane(ID_EDIT_CLEAR, L"Status Pane text");
	//m_wndStatusBar.AddElement(pPane, NULL);
	m_wndStatusBar.SetInformation(L"Ready");

	/*TODO: AUTOMATIC CALC PANE SIZE */
	CString lineTest(L'_', CString("Ln 9999    Col 999").GetLength());
	CMFCRibbonStatusBarPane* pPane = new CMFCRibbonStatusBarPane(ID_INDICATOR_LNCOL, lineTest, TRUE);
	m_wndStatusBar.AddExtendedElement(pPane, L"Ln & Col");
	//CRect paneRect = pPane->GetRect();
	//paneRect.right = paneRect.left + 100;
	//pPane->SetRect(paneRect);


	//m_wndStatusBar.SetIndicators(indicators, sizeof(indicators)/sizeof(UINT));

	// TODO: Delete these five lines if you don't want the toolbar and menubar to be dockable
	//m_wndMenuBar.EnableDocking(CBRS_ALIGN_ANY);
	//m_wndToolBar.EnableDocking(CBRS_ALIGN_ANY);


	DockPane(&m_wndMenuBar);
	DockPane(&m_wndToolBar);
	m_borderPanes.DockPanes(this);

	EnableDocking(CBRS_ALIGN_ANY);

	CDockingManager::SetDockingMode(DT_SMART);
	EnableAutoHidePanes(CBRS_ALIGN_ANY);

	// Load menu item image (not placed on any standard toolbars):
	CMFCToolBar::AddToolBarForImageCollection(IDR_MENU_IMAGES, IDR_MENU_IMAGES);

	// create docking windows
	if (!CreateDockingWindows())
	{
		TRACE0("Failed to create docking windows\n");
		return -1;
	}

	CDockablePane* pTabbedBar = NULL;
	m_wndOutput.EnableDocking(CBRS_ALIGN_ANY);
	m_wndCommand.EnableDocking(CBRS_ALIGN_ANY);
	m_wndConsole.EnableDocking(CBRS_ALIGN_ANY);
	DockPane(&m_wndCommand);
	m_wndOutput.AttachToTabWnd(&m_wndCommand, DM_SHOW, FALSE, &pTabbedBar);
	m_wndConsole.AttachToTabWnd(&m_wndCommand, DM_SHOW, FALSE, &pTabbedBar);


	m_wndSolution.EnableDocking(CBRS_ALIGN_ANY);
	m_wndToolBox.EnableDocking(CBRS_ALIGN_ANY);
	DockPane(&m_wndSolution);
	m_wndToolBox.AttachToTabWnd(&m_wndSolution, DM_SHOW, FALSE, &pTabbedBar);

	m_wndProperties.EnableDocking(CBRS_ALIGN_ANY);
	m_wndOutline.EnableDocking(CBRS_ALIGN_ANY);
	DockPane(&m_wndProperties);

	m_wndOutline.AttachToTabWnd(&m_wndProperties, DM_SHOW, FALSE, &pTabbedBar);


	// set the visual manager and style based on persisted value
	CMFCVisualManager::SetDefaultManager(RUNTIME_CLASS(CA2VisualManager));

	// Enable enhanced windows management dialog
	EnableWindowsDialog(ID_WINDOW_MANAGER, ID_WINDOW_MANAGER, TRUE);

	// Enable toolbar and docking window menu replacement
	EnablePaneMenu(TRUE, 0, strCustomize, ID_VIEW_TOOLBAR);

	// Switch the order of document name and application name on the window title bar. This
	// improves the usability of the taskbar because the document name is visible with the thumbnail.
	ModifyStyle(0, FWS_PREFIXTITLE);

	CRect rc;
	GetWindowRect(&rc);
	SetWindowPos(NULL, rc.left, rc.top, rc.Width(), rc.Height(), SWP_FRAMECHANGED | SWP_NOZORDER);

	return 0;
}

BOOL CMainFrame::PreCreateWindow(CREATESTRUCT& cs)
{
	cs.style &= ~(FWS_ADDTOTITLE);
	if (!__super::PreCreateWindow(cs))
		return FALSE;
	return TRUE;
}

BOOL CMainFrame::CreateDockingWindows()
{
	CString strTitle;

	DWORD dwDefaultStyle =
		WS_CHILD | WS_VISIBLE | WS_CLIPSIBLINGS | WS_CLIPCHILDREN | CBRS_FLOAT_MULTI;

	// Create class view
	VERIFY(strTitle.LoadString(ID_WND_SOLUTION));
	if (!m_wndSolution.Create(strTitle, this, CRect(0, 0, VERT_PANE_WIDTH, 500), TRUE, ID_WND_SOLUTION,
		dwDefaultStyle | CBRS_LEFT))
	{
		TRACE0("Failed to create Solution Explorer window\n");
		return FALSE; // failed to create
	}

	// Create outline view
	VERIFY(strTitle.LoadString(ID_WND_OUTLINE));
	if (!m_wndOutline.Create(strTitle, this, CRect(0, 0, VERT_PANE_WIDTH, 500), TRUE, ID_WND_OUTLINE,
		dwDefaultStyle | CBRS_LEFT))
	{
		TRACE0("Failed to create Outline window\n");
		return FALSE; // failed to create
	}

	// Create Toolbox
	VERIFY(strTitle.LoadString(ID_WND_TOOLBOX));
	if (!m_wndToolBox.Create(strTitle, this, CRect(0, 0, VERT_PANE_WIDTH, 500), TRUE, ID_WND_TOOLBOX,
		dwDefaultStyle | CBRS_LEFT))
	{
		TRACE0("Failed to create ToolBox window\n");
		return FALSE; // failed to create
	}

	// Create output window
	VERIFY(strTitle.LoadString(IDS_OUTPUT_WND));
	if (!m_wndOutput.Create(strTitle, this, CRect(0, 0, 500, HORZ_PANE_HEIGHT), TRUE, ID_VIEW_OUTPUTWND,
		dwDefaultStyle | CBRS_BOTTOM))
	{
		TRACE0("Failed to create Output window\n");
		return FALSE; // failed to create
	}

	// Command window
	VERIFY(strTitle.LoadString(ID_WND_COMMAND));
	if (!m_wndCommand.Create(strTitle, this, CRect(0, 0, 500, HORZ_PANE_HEIGHT), TRUE, ID_WND_COMMAND,
		dwDefaultStyle | CBRS_BOTTOM))
	{
		TRACE0("Failed to create command window\n");
		return FALSE; // failed to create
	}

	// console window
	VERIFY(strTitle.LoadString(ID_WND_CONSOLE));
	if (!m_wndConsole.Create(strTitle, this, CRect(0, 0, 500, HORZ_PANE_HEIGHT), TRUE, ID_WND_CONSOLE,
		dwDefaultStyle | CBRS_BOTTOM))
	{
		TRACE0("Failed to create console window\n");
		return FALSE; // failed to create
	}

	// Properties window
	VERIFY(strTitle.LoadString(ID_WND_PROPERTIES));
	if (!m_wndProperties.Create(strTitle, this, CRect(0, 0, VERT_PANE_WIDTH, 500), TRUE, ID_WND_PROPERTIES,
		dwDefaultStyle | CBRS_RIGHT))
	{
		TRACE0("Failed to create Properties window\n");
		return FALSE; // failed to create
	}

	SetDockingWindowIcons();
	return TRUE;
}

void CMainFrame::SetDockingWindowIcons()
{
	HINSTANCE hInst = ::AfxGetResourceHandle();
	CSize szIcon(::GetSystemMetrics(SM_CXSMICON), ::GetSystemMetrics(SM_CYSMICON));

	HICON hIcon;

	hIcon = (HICON) ::LoadImage(hInst, MAKEINTRESOURCE(ID_WND_OUTLINE), IMAGE_ICON, szIcon.cx, szIcon.cy, 0);
	m_wndOutline.SetIcon(hIcon, FALSE);

	HICON hOutputBarIcon = (HICON) ::LoadImage(hInst, MAKEINTRESOURCE(IDI_OUTPUT_WND_HC), IMAGE_ICON, ::GetSystemMetrics(SM_CXSMICON), ::GetSystemMetrics(SM_CYSMICON), 0);
	m_wndOutput.SetIcon(hOutputBarIcon, FALSE);

	hIcon = (HICON) ::LoadImage(hInst, MAKEINTRESOURCE(ID_WND_PROPERTIES), IMAGE_ICON, szIcon.cx, szIcon.cy, 0);
	m_wndProperties.SetIcon(hIcon, FALSE);

	hIcon = (HICON) ::LoadImage(hInst, MAKEINTRESOURCE(ID_WND_COMMAND), IMAGE_ICON, szIcon.cx, szIcon.cy, 0);
	m_wndCommand.SetIcon(hIcon, FALSE);

	hIcon = (HICON) ::LoadImage(hInst, MAKEINTRESOURCE(ID_WND_CONSOLE), IMAGE_ICON, szIcon.cx, szIcon.cy, 0);
	m_wndConsole.SetIcon(hIcon, FALSE);

	hIcon = (HICON) ::LoadImage(hInst, MAKEINTRESOURCE(ID_WND_TOOLBOX), IMAGE_ICON, szIcon.cx, szIcon.cy, 0);
	m_wndToolBox.SetIcon(hIcon, FALSE);

	hIcon = (HICON) ::LoadImage(hInst, MAKEINTRESOURCE(ID_WND_SOLUTION), IMAGE_ICON, szIcon.cx, szIcon.cy, 0);
	m_wndSolution.SetIcon(hIcon, FALSE);

	UpdateMDITabbedBarsIcons();
}

// CMainFrame diagnostics

#ifdef _DEBUG
void CMainFrame::AssertValid() const
{
	__super::AssertValid();
}

void CMainFrame::Dump(CDumpContext& dc) const
{
	__super::Dump(dc);
}
#endif //_DEBUG


// virtual 
BOOL CMainFrame::OnSetMenu(HMENU hmenu)
{
	// flicker free menu update
	m_wndMenuBar.LockWindowUpdate();
	BOOL rc = __super::OnSetMenu(hmenu);
	m_wndMenuBar.UnlockWindowUpdate();
	return rc;
}

// CMainFrame message handlers


void CMainFrame::OnViewCustomize()
{
	CMFCToolBarsCustomizeDialog* pDlgCust = new CMFCToolBarsCustomizeDialog(this, TRUE /* scan menus */);
	pDlgCust->Create();
}

void CMainFrame::OnViewSolution()
{
	// Show or activate the pane, depending on current state.  The
	// pane can only be closed via the [x] button on the pane frame.
	m_wndSolution.ShowPane(TRUE, FALSE, TRUE);
	m_wndSolution.SetFocus();
}

void CMainFrame::OnViewOutputWindow()
{
	// Show or activate the pane, depending on current state.  The
	// pane can only be closed via the [x] button on the pane frame.
	m_wndOutput.ShowPane(TRUE, FALSE, TRUE);
	m_wndOutput.SetFocus();
}

void CMainFrame::OnUpdateViewOutputWindow(CCmdUI* pCmdUI)
{
	pCmdUI->Enable(TRUE);
}

// afx_msg
void CMainFrame::OnViewCommand()
{
	m_wndCommand.ShowPane(TRUE, FALSE, TRUE);
	m_wndCommand.SetFocus();
}

// afx_msg
void CMainFrame::OnViewProperties()
{
	m_wndProperties.ShowPane(TRUE, FALSE, TRUE);
	m_wndProperties.SetFocus();
}

void CMainFrame::OnViewToolbox()
{
	m_wndToolBox.ShowPane(TRUE, FALSE, TRUE);
	m_wndToolBox.SetFocus();
}

void CMainFrame::OnViewOutline()
{
	m_wndOutline.ShowPane(TRUE, FALSE, TRUE);
	m_wndOutline.SetFocus();

}

void CMainFrame::OnViewConsole()
{
	m_wndConsole.ShowPane(TRUE, FALSE, TRUE);
	m_wndConsole.SetFocus();

}

void CMainFrame::OnEnableAlways(CCmdUI* pCmdUI)
{
	pCmdUI->Enable(TRUE);
}


void CMainFrame::OnSettingChange(UINT uFlags, LPCTSTR lpszSection)
{
	__super::OnSettingChange(uFlags, lpszSection);
	m_wndOutput.UpdateFonts();
}

// afx_msg 
LRESULT CMainFrame::OnDebugMessage(WPARAM wParam, LPARAM lParam)
{
	if (!CAppData::IsDebug())
		return 0L;
	if (wParam == WMIC_DEBUG_MSG_WPARAM) {
		TRACE_INFO* pTI = reinterpret_cast<TRACE_INFO*>(lParam);
		if (pTI) {
			if (!m_wndOutput.IsWindowVisible()) {
				ShowPane(&m_wndOutput, TRUE, FALSE, FALSE); // без задержки
			}
			m_wndOutput.DoTrace(*pTI);
		}
	}
	return 0L;
}


void CMainFrame::OnHelpFinder()
{
	CMFCToolBarComboBoxButton* pCombo = m_wndMenuBar.GetHelpCombobox();
	CString txt = pCombo->GetText();
	if (txt.IsEmpty())
		return;
	CString msg;
	msg.Format(L"Search help for \"%s\"", txt);
	if (pCombo->FindItem(txt) == -1)
		pCombo->AddItem(txt);
	AfxMessageBox(msg);
}

// afx_msg
LRESULT CMainFrame::OnWmiDebugBreak(WPARAM wParam, LPARAM lParam) 
{
	if (wParam != WMI_DEBUG_BREAK_WPARAM)
		return 0L;
	DEBUG_BREAK_INFO* pBreakInfo = reinterpret_cast<DEBUG_BREAK_INFO*>(lParam);
	if (!pBreakInfo)
		return 0;
	CWnd* pWnd = FindOrCreateCodeWindow(pBreakInfo->szFileName);
	if (pWnd)
		pWnd->SendMessage(WMI_DEBUG_BREAK, wParam, lParam);
	return 0L;
}

// afx_msg
LRESULT CMainFrame::OnWmiConsole(WPARAM wParam, LPARAM lParam) 
{
	if ((wParam < WMI_CONSOLE_MIN) || (wParam > WMI_CONSOLE_MAX))
		return 0L;
	LPCWSTR szMessage = reinterpret_cast<LPCWSTR>(lParam);
	if (!szMessage)
		return 0L;
	m_wndConsole.WriteToConsole((CConsoleWnd::ConsoleMsgType) wParam, szMessage);
	return 0L;
}

// virtual 
void CMainFrame::OnDebugModeChanged(bool /*bDebug*/)
{
	// change status bar color
	m_wndStatusBar.Invalidate();
}

CWnd* CMainFrame::FindOrCreateCodeWindow(LPCWSTR szFileName)
{
	POSITION tPos = theApp.m_pDocManager->GetFirstDocTemplatePosition();
	while (tPos) {
		CDocTemplate* pTemplate = theApp.m_pDocManager->GetNextDocTemplate(tPos);
		POSITION dPos = pTemplate->GetFirstDocPosition();
		while (dPos) {
			CDocument* pDoc = pTemplate->GetNextDoc(dPos);
			if (pDoc->GetPathName() == szFileName) {
				POSITION vPos = pDoc->GetFirstViewPosition();
				if (vPos) {
					return pDoc->GetNextView(vPos);
				}
			}
		}
	}
	return NULL;
}

// afx_msg
void CMainFrame::OnUpdateLineNo(CCmdUI* pCmdUI) 
{
	pCmdUI->Enable(TRUE);
	pCmdUI->SetText(L"");
}