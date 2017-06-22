
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
	ON_COMMAND(ID_WINDOW_MANAGER, &CMainFrame::OnWindowManager)
	//ON_COMMAND(ID_VIEW_CUSTOMIZE, &CMainFrame::OnViewCustomize)
	//ON_COMMAND_RANGE(ID_VIEW_APPLOOK_WIN_2000, ID_VIEW_APPLOOK_WINDOWS_7, &CMainFrame::OnApplicationLook)
	//ON_UPDATE_COMMAND_UI_RANGE(ID_VIEW_APPLOOK_WIN_2000, ID_VIEW_APPLOOK_WINDOWS_7, &CMainFrame::OnUpdateApplicationLook)
	/*
	Нельзя использовать команду показа панели для ее ID!
	Если это включить, то исчезают отметки в меню по правой кнопке.
	ON_COMMAND(ID_VIEW_OUTPUTWND, &CMainFrame::OnViewOutputWindow)
	ON_UPDATE_COMMAND_UI(ID_VIEW_OUTPUTWND, &CMainFrame::OnUpdateViewOutputWindow)
	*/
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
END_MESSAGE_MAP()

static UINT indicators[] =
{
	ID_SEPARATOR,           // status line indicator
	ID_INDICATOR_CAPS,
	ID_INDICATOR_NUM,
	ID_INDICATOR_SCRL,
};

// CMainFrame construction/destruction

CMainFrame::CMainFrame()
{
	// TODO: add member initialization code here
	//theApp.m_nAppLook = theApp.GetInt(_T("ApplicationLook"), ID_VIEW_APPLOOK_OFF_2007_AQUA);
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

	BOOL bNameValid;

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
	bNameValid = strToolBarName.LoadString(IDS_TOOLBAR_STANDARD);
	ASSERT(bNameValid);
	m_wndToolBar.SetWindowText(strToolBarName);

	CString strCustomize;
	//bNameValid = strCustomize.LoadString(IDS_TOOLBAR_CUSTOMIZE);
	//ASSERT(bNameValid);
	m_wndToolBar.EnableCustomizeButton(TRUE, 0, strCustomize);

	if (!m_wndStatusBar.Create(this))
	{
		TRACE0("Failed to create status bar\n");
		return -1;      // fail to create
	}
	//CMFCRibbonStatusBarPane* pPane = new CMFCRibbonStatusBarPane(ID_EDIT_CLEAR, L"Status Pane text");
	//m_wndStatusBar.AddElement(pPane, NULL);
	m_wndStatusBar.SetInformation(L"Ready");
	//m_wndStatusBar.SetIndicators(indicators, sizeof(indicators)/sizeof(UINT));

	// TODO: Delete these five lines if you don't want the toolbar and menubar to be dockable
	//m_wndMenuBar.EnableDocking(CBRS_ALIGN_ANY);
	//m_wndToolBar.EnableDocking(CBRS_ALIGN_ANY);


	DockPane(&m_wndMenuBar);
	DockPane(&m_wndToolBar);
	m_borderPanes.DockPanes(this);

	EnableDocking(CBRS_ALIGN_ANY);

	// enable Visual Studio 2005 style docking window behavior
	CDockingManager::SetDockingMode(DT_SMART);
	// enable Visual Studio 2005 style docking window auto-hide behavior
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
	DockPane(&m_wndOutput);
	m_wndCommand.AttachToTabWnd(&m_wndOutput, DM_SHOW, FALSE, &pTabbedBar);


	m_wndFileView.EnableDocking(CBRS_ALIGN_ANY);
	m_wndSolution.EnableDocking(CBRS_ALIGN_ANY);
	m_wndToolBox.EnableDocking(CBRS_ALIGN_ANY);
	DockPane(&m_wndFileView);
	m_wndSolution.AttachToTabWnd(&m_wndFileView, DM_SHOW, TRUE, &pTabbedBar);
	//pTabbedBar->Attach()
	m_wndToolBox.AttachToTabWnd(&m_wndFileView, DM_SHOW, FALSE, &pTabbedBar);

	m_wndProperties.EnableDocking(CBRS_ALIGN_ANY);
	DockPane(&m_wndProperties);



	// set the visual manager and style based on persisted value
	CMFCVisualManager::SetDefaultManager(RUNTIME_CLASS(CA2VisualManager));

	// Enable enhanced windows management dialog
	EnableWindowsDialog(ID_WINDOW_MANAGER, ID_WINDOW_MANAGER, TRUE);

	// Enable toolbar and docking window menu replacement
	EnablePaneMenu(TRUE, 0, strCustomize, ID_VIEW_TOOLBAR);

	// enable quick (Alt+drag) toolbar customization
	//CMFCToolBar::EnableQuickCustomization();

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
	if (!__super::PreCreateWindow(cs))
		return FALSE;
	// TODO: Modify the Window class or styles here by modifying
	//  the CREATESTRUCT cs

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

	// Create file view
	VERIFY(strTitle.LoadString(ID_WND_OUTLINE));
	if (!m_wndFileView.Create(strTitle, this, CRect(0, 0, VERT_PANE_WIDTH, 500), TRUE, ID_WND_OUTLINE,
		dwDefaultStyle | CBRS_LEFT))
	{
		TRACE0("Failed to create File View window\n");
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

	// Create command window
	VERIFY(strTitle.LoadString(ID_WND_COMMAND));
	if (!m_wndCommand.Create(strTitle, this, CRect(0, 0, 500, HORZ_PANE_HEIGHT), TRUE, ID_WND_COMMAND,
		dwDefaultStyle | CBRS_BOTTOM))
	{
		TRACE0("Failed to create command window\n");
		return FALSE; // failed to create
	}

	// Create properties window
	VERIFY(strTitle.LoadString(ID_WND_PROPERTIES));
	if (!m_wndProperties.Create(strTitle, this, CRect(0, 0, VERT_PANE_WIDTH, 500), TRUE, ID_WND_PROPERTIES,
		dwDefaultStyle | CBRS_RIGHT))
	{
		TRACE0("Failed to create Properties window\n");
		return FALSE; // failed to create
	}

	SetDockingWindowIcons(theApp.m_bHiColorIcons);
	return TRUE;
}

void CMainFrame::SetDockingWindowIcons(BOOL bHiColorIcons)
{
	HINSTANCE hInst = ::AfxGetResourceHandle();
	CSize szIcon(::GetSystemMetrics(SM_CXSMICON), ::GetSystemMetrics(SM_CYSMICON));

	HICON hIcon;


	hIcon = (HICON) ::LoadImage(hInst, MAKEINTRESOURCE(ID_WND_OUTLINE), IMAGE_ICON, szIcon.cx, szIcon.cy, 0);
	m_wndFileView.SetIcon(hIcon, FALSE);

	HICON hOutputBarIcon = (HICON) ::LoadImage(hInst, MAKEINTRESOURCE(IDI_OUTPUT_WND_HC), IMAGE_ICON, ::GetSystemMetrics(SM_CXSMICON), ::GetSystemMetrics(SM_CYSMICON), 0);
	m_wndOutput.SetIcon(hOutputBarIcon, FALSE);

	hIcon = (HICON) ::LoadImage(hInst, MAKEINTRESOURCE(ID_WND_PROPERTIES), IMAGE_ICON, szIcon.cx, szIcon.cy, 0);
	m_wndProperties.SetIcon(hIcon, FALSE);

	hIcon = (HICON) ::LoadImage(hInst, MAKEINTRESOURCE(ID_WND_COMMAND), IMAGE_ICON, szIcon.cx, szIcon.cy, 0);
	m_wndCommand.SetIcon(hIcon, FALSE);

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

void CMainFrame::OnWindowManager()
{
	ShowWindowsDialog();
}

void CMainFrame::OnViewCustomize()
{
	CMFCToolBarsCustomizeDialog* pDlgCust = new CMFCToolBarsCustomizeDialog(this, TRUE /* scan menus */);
	pDlgCust->Create();
}

void CMainFrame::OnApplicationLook(UINT id)
{
	/*
	CWaitCursor wait;

	theApp.m_nAppLook = id;

	switch (theApp.m_nAppLook)
	{
	case ID_VIEW_APPLOOK_WIN_2000:
		CMFCVisualManager::SetDefaultManager(RUNTIME_CLASS(CMFCVisualManager));
		break;

	case ID_VIEW_APPLOOK_OFF_XP:
		CMFCVisualManager::SetDefaultManager(RUNTIME_CLASS(CMFCVisualManagerOfficeXP));
		break;

	case ID_VIEW_APPLOOK_WIN_XP:
		CMFCVisualManagerWindows::m_b3DTabsXPTheme = TRUE;
		CMFCVisualManager::SetDefaultManager(RUNTIME_CLASS(CMFCVisualManagerWindows));
		break;

	case ID_VIEW_APPLOOK_OFF_2003:
		CMFCVisualManager::SetDefaultManager(RUNTIME_CLASS(CMFCVisualManagerOffice2003));
		CDockingManager::SetDockingMode(DT_SMART);
		break;

	case ID_VIEW_APPLOOK_VS_2005:
		CMFCVisualManager::SetDefaultManager(RUNTIME_CLASS(CMFCVisualManagerVS2005));
		CDockingManager::SetDockingMode(DT_SMART);
		break;

	case ID_VIEW_APPLOOK_VS_2008:
		CMFCVisualManager::SetDefaultManager(RUNTIME_CLASS(CMFCVisualManagerVS2008));
		CDockingManager::SetDockingMode(DT_SMART);
		break;

	case ID_VIEW_APPLOOK_WINDOWS_7:
		CMFCVisualManager::SetDefaultManager(RUNTIME_CLASS(CMFCVisualManagerWindows7));
		CDockingManager::SetDockingMode(DT_SMART);
		break;

	default:
		switch (theApp.m_nAppLook)
		{
		case ID_VIEW_APPLOOK_OFF_2007_BLUE:
			CMFCVisualManagerOffice2007::SetStyle(CMFCVisualManagerOffice2007::Office2007_LunaBlue);
			break;

		case ID_VIEW_APPLOOK_OFF_2007_BLACK:
			CMFCVisualManagerOffice2007::SetStyle(CMFCVisualManagerOffice2007::Office2007_ObsidianBlack);
			break;

		case ID_VIEW_APPLOOK_OFF_2007_SILVER:
			CMFCVisualManagerOffice2007::SetStyle(CMFCVisualManagerOffice2007::Office2007_Silver);
			break;

		case ID_VIEW_APPLOOK_OFF_2007_AQUA:
			CMFCVisualManagerOffice2007::SetStyle(CMFCVisualManagerOffice2007::Office2007_Aqua);
			break;
		}

		CMFCVisualManager::SetDefaultManager(RUNTIME_CLASS(CMFCVisualManagerOffice2007));
		CDockingManager::SetDockingMode(DT_SMART);
	}

	m_wndOutput.UpdateFonts();
	RedrawWindow(NULL, NULL, RDW_ALLCHILDREN | RDW_INVALIDATE | RDW_UPDATENOW | RDW_FRAME | RDW_ERASE);

	theApp.WriteInt(_T("ApplicationLook"), theApp.m_nAppLook);
	*/
}

void CMainFrame::OnUpdateApplicationLook(CCmdUI* pCmdUI)
{
	//pCmdUI->SetRadio(theApp.m_nAppLook == pCmdUI->m_nID);
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
	m_wndFileView.ShowPane(TRUE, FALSE, TRUE);
	m_wndFileView.SetFocus();

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
