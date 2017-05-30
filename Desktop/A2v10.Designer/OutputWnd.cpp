
#include "stdafx.h"

#include "outputwnd.h"
#include "Resource.h"
#include "mainfrm.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

#define DEFAULT_MESSAGE_WIDTH 500

/////////////////////////////////////////////////////////////////////////////
// COutputBar

COutputWnd::COutputWnd()
{
	m_wndToolBar.SetUpdateCmdUIByOwner(TRUE);
}

COutputWnd::~COutputWnd()
{
}

BEGIN_MESSAGE_MAP(COutputWnd, CA2DockablePane)
	ON_WM_CREATE()
	ON_WM_SIZE()
	ON_WM_SETTINGCHANGE()
END_MESSAGE_MAP()

int COutputWnd::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;

	CRect rectDummy;
	rectDummy.SetRectEmpty();

	/*
	// Create tabs window:
	if (!m_wndTabs.Create(CMFCTabCtrl::STYLE_3D, rectDummy, this, 1))
	{
	TRACE0("Failed to create output tab window\n");
	return -1;      // fail to create
	}
	*/

	// Create output panes:
	const DWORD dwStyle = LBS_NOINTEGRALHEIGHT | WS_CHILD | WS_VISIBLE | WS_HSCROLL | WS_VSCROLL;

	/*
	if (!m_wndOutputBuild.Create(dwStyle, rectDummy, &m_wndTabs, 2) ||
	!m_wndOutputDebug.Create(dwStyle, rectDummy, &m_wndTabs, 3) ||
	!m_wndOutputFind.Create(dwStyle, rectDummy, &m_wndTabs, 4))
	{
	TRACE0("Failed to create output windows\n");
	return -1;      // fail to create
	}
	*/

	const DWORD dwDebugStyle =
		WS_CHILD | WS_VISIBLE |
		LVS_REPORT | LVS_SHAREIMAGELISTS | LVS_SHOWSELALWAYS;

	if (!m_wndOutputDebug.Create(dwDebugStyle, rectDummy, this, 3))
		return -1;

	//m_wndOutputDebug.SetFont(CTheme::GetUIFont());
	//m_wndOutputDebug.SetImageList(CTheme::GetImageList(), LVSIL_SMALL);
	m_wndOutputDebug.SetExtendedStyle(
		LVS_EX_DOUBLEBUFFER | LVS_EX_LABELTIP |
		LVS_EX_FULLROWSELECT | LVS_EX_GRIDLINES);
	// %%%TODO:RES
	m_wndOutputDebug.InsertColumn(0, L"Category");
	m_wndOutputDebug.SetColumnWidth(0, LVSCW_AUTOSIZE_USEHEADER);
	m_wndOutputDebug.InsertColumn(1, L"Time", LVCFMT_CENTER, 70);
	m_wndOutputDebug.InsertColumn(2, L"Message", LVCFMT_LEFT, DEFAULT_MESSAGE_WIDTH);
	m_wndOutputDebug.InsertColumn(3, L"File", LVCFMT_LEFT, 320);

	UpdateFonts();

	//CString strTabName;
	//BOOL bNameValid;

	/*
	// Attach list windows to tab:
	bNameValid = strTabName.LoadString(IDS_BUILD_TAB);
	ASSERT(bNameValid);
	m_wndTabs.AddTab(&m_wndOutputBuild, strTabName, (UINT)0);
	*/
	//bNameValid = strTabName.LoadString(IDS_DEBUG_TAB);
	//ASSERT(bNameValid);
	//m_wndTabs.AddTab(&m_wndOutputDebug, strTabName, (UINT)1);
	/*
	bNameValid = strTabName.LoadString(IDS_FIND_TAB);
	ASSERT(bNameValid);
	m_wndTabs.AddTab(&m_wndOutputFind, strTabName, (UINT)2);
	*/

	// Fill output tabs with some dummy text (nothing magic here)
	/*
	FillBuildWindow();
	FillDebugWindow();
	FillFindWindow();
	*/

	const DWORD dwToolbarStyle =
		(WS_CHILD | WS_VISIBLE | CBRS_TOP | CBRS_HIDE_INPLACE | CBRS_TOOLTIPS | CBRS_FLYBY);

	m_wndToolBar.Create(this, dwToolbarStyle, IDR_PROPERTIES);
	m_wndToolBar.LoadToolBar(IDR_MAINFRAME); //, 0, 0, TRUE /* Is locked */);

	m_wndToolBar.SetPaneStyle(m_wndToolBar.GetPaneStyle() & ~(CBRS_SIZE_DYNAMIC | CBRS_BORDER_TOP | CBRS_BORDER_BOTTOM | CBRS_BORDER_LEFT | CBRS_BORDER_RIGHT));
	m_wndToolBar.SetOwner(this);

	// All commands will be routed via this control , not via the parent frame:
	m_wndToolBar.SetRouteCommandsViaFrame(FALSE);

	return 0;
}

void COutputWnd::OnSize(UINT nType, int cx, int cy)
{
	__super::OnSize(nType, cx, cy);
	// Tab control should cover the whole client area:
	CRect rc;
	GetClientRect(rc);
	AdjustBorder(rc);

	int cyTlb = m_wndToolBar.CalcFixedLayout(FALSE, TRUE).cy;

	m_wndToolBar.SetWindowPos(NULL, rc.left, rc.top, rc.Width(), cyTlb, SWP_NOACTIVATE | SWP_NOZORDER);
	m_wndOutputDebug.SetWindowPos(NULL, rc.left, rc.top + cyTlb, rc.Width(), rc.Height() - cyTlb, SWP_NOACTIVATE | SWP_NOZORDER);
	//m_wndTabs.SetWindowPos (NULL, -1, -1, cx, cy, SWP_NOMOVE | SWP_NOACTIVATE | SWP_NOZORDER);
}

void COutputWnd::AdjustHorzScroll(CListBox& wndListBox)
{
	CClientDC dc(this);
	CFont* pOldFont = dc.SelectObject(&afxGlobalData.fontRegular);

	int cxExtentMax = 0;

	for (int i = 0; i < wndListBox.GetCount(); i++)
	{
		CString strItem;
		wndListBox.GetText(i, strItem);

		cxExtentMax = max(cxExtentMax, (int)dc.GetTextExtent(strItem).cx);
	}

	wndListBox.SetHorizontalExtent(cxExtentMax);
	dc.SelectObject(pOldFont);
}

void COutputWnd::FillBuildWindow()
{
	/*
	m_wndOutputBuild.AddString(_T("Build output is being displayed here."));
	m_wndOutputBuild.AddString(_T("The output is being displayed in rows of a list view"));
	m_wndOutputBuild.AddString(_T("but you can change the way it is displayed as you wish..."));
	*/
}

void COutputWnd::FillDebugWindow()
{
	/*
	m_wndOutputDebug.AddString(_T("Debug output is being displayed here."));
	m_wndOutputDebug.AddString(_T("The output is being displayed in rows of a list view"));
	m_wndOutputDebug.AddString(_T("but you can change the way it is displayed as you wish..."));
	*/
}

void COutputWnd::FillFindWindow()
{
	/*
	m_wndOutputFind.AddString(_T("Find output is being displayed here."));
	m_wndOutputFind.AddString(_T("The output is being displayed in rows of a list view"));
	m_wndOutputFind.AddString(_T("but you can change the way it is displayed as you wish..."));
	*/
}

void COutputWnd::UpdateFonts()
{
	//m_wndOutputBuild.SetFont(&afxGlobalData.fontRegular);
	if (m_wndOutputDebug.GetSafeHwnd())
		m_wndOutputDebug.SetFont(&afxGlobalData.fontRegular);
	//m_wndOutputFind.SetFont(&afxGlobalData.fontRegular);
}

void COutputWnd::Clear()
{
	if (!GetSafeHwnd())
		return;
	m_wndOutputDebug.Clear();
}

// afx_msg 
void COutputWnd::OnSettingChange(UINT uFlags, LPCWSTR lpszSection)
{
	UpdateFonts();
}


void COutputWnd::DoTrace(const TRACE_INFO& ti)
{
	if (!CAppData::IsDebug())
		return;
	CDisableRedraw dr(&m_wndOutputDebug);
	LPCWSTR szCat = L"UNK"; // CAppData::TraceCat2String(ti.tc);
	int iImage = (ti.tt == TRACE_TYPE_ERROR) ? 50 :
		(ti.tt == TRACE_TYPE_WARNING) ? 51 :
		(ti.tt == TRACE_TYPE_INFO) ? 52 : 0;
	int x = m_wndOutputDebug.InsertItem(m_wndOutputDebug.GetItemCount(), szCat, iImage);
	m_wndOutputDebug.SetItemText(x, 1, ti.time.Format(L"%H:%M:%S"));
	m_wndOutputDebug.SetItemText(x, 2, ti.szText);
	m_wndOutputDebug.SetItemText(x, 3, ti.szFile);
	m_wndOutputDebug.EnsureVisible(x, TRUE);
}

/////////////////////////////////////////////////////////////////////////////
// COutputList1

COutputList::COutputList()
{
}

COutputList::~COutputList()
{
}

BEGIN_MESSAGE_MAP(COutputList, CListBox)
	ON_WM_CONTEXTMENU()
	ON_COMMAND(ID_EDIT_COPY, OnEditCopy)
	ON_COMMAND(ID_EDIT_CLEAR, OnEditClear)
	ON_COMMAND(ID_VIEW_OUTPUTWND, OnViewOutput)
	ON_WM_WINDOWPOSCHANGING()
END_MESSAGE_MAP()
/////////////////////////////////////////////////////////////////////////////
// COutputList message handlers

void COutputList::OnContextMenu(CWnd* /*pWnd*/, CPoint point)
{
	CMenu menu;
	menu.LoadMenu(IDR_OUTPUT_POPUP);

	CMenu* pSumMenu = menu.GetSubMenu(0);

	if (AfxGetMainWnd()->IsKindOf(RUNTIME_CLASS(CMDIFrameWndEx)))
	{
		CMFCPopupMenu* pPopupMenu = new CMFCPopupMenu();

		if (!pPopupMenu->Create(this, point.x, point.y, (HMENU)pSumMenu->m_hMenu, FALSE, TRUE))
			return;

		((CMDIFrameWndEx*)AfxGetMainWnd())->OnShowPopupMenu(pPopupMenu);
		UpdateDialogControls(this, FALSE);
	}

	SetFocus();
}

void COutputList::OnEditCopy()
{
	MessageBox(_T("Copy output"));
}

void COutputList::OnEditClear()
{
	MessageBox(_T("Clear output"));
}

void COutputList::OnViewOutput()
{
	CDockablePane* pParentBar = DYNAMIC_DOWNCAST(CDockablePane, GetOwner());
	CMDIFrameWndEx* pMainFrame = DYNAMIC_DOWNCAST(CMDIFrameWndEx, GetTopLevelFrame());

	if (pMainFrame != NULL && pParentBar != NULL)
	{
		pMainFrame->SetFocus();
		pMainFrame->ShowPane(pParentBar, FALSE, FALSE, FALSE);
		pMainFrame->RecalcLayout();

	}
}

/////////////////////////////////////////////////////////////////////////////
// CTraceList

// afx_msg 
void CTraceList::OnContextMenu(CWnd* pWnd, CPoint point)
{
	/*
	CMenu menu;
	menu.LoadMenu(IDM_POPUP);

	CMenu* pSumMenu = menu.GetSubMenu(0); // _TRACE_

	CMFCPopupMenu* pPopupMenu = new CMFCPopupMenu;

	if (!pPopupMenu->Create(this, point.x, point.y, (HMENU)pSumMenu->m_hMenu, FALSE, TRUE))
	return;

	((CFrameWndEx*)AfxGetMainWnd())->OnShowPopupMenu(pPopupMenu);
	UpdateDialogControls(this, FALSE);

	SetFocus();
	*/
}

// afx_msg 
void CTraceList::OnEditCopy()
{
	CString text;
	text.Preallocate(1024);
	int nCols = GetHeaderCtrl().GetItemCount();
	POSITION pos = GetFirstSelectedItemPosition();
	if (pos == NULL)
		return;
	while (pos) {
		int iItem = GetNextSelectedItem(pos);
		CString sx;
		for (int i = 0; i<nCols; i++) {
			if (!sx.IsEmpty())
				sx += L"\t";
			sx += GetItemText(iItem, i);
		}
		if (!text.IsEmpty())
			text += L"\r\n";
		text += sx;
	}
	HGLOBAL hglbCopy = ::GlobalAlloc(GMEM_MOVEABLE, (text.GetLength() + 1) * sizeof(WCHAR));
	LPWSTR pS = (LPWSTR)GlobalLock(hglbCopy);
	wcscpy_s(pS, text.GetLength() + 1, (LPCWSTR)text);
	::GlobalUnlock(hglbCopy);
	OpenClipboard();
	::EmptyClipboard();
	::SetClipboardData(CF_UNICODETEXT, hglbCopy);
	::CloseClipboard();
}

// afx_msg 
void CTraceList::OnEditClear()
{
	Clear();
}

void CTraceList::Clear()
{
	DeleteAllItems();
	CAppData::ClearTrace();
}

// afx_msg 
void CTraceList::OnUpdateEditCopy(CCmdUI* pCmdUI)
{
	pCmdUI->Enable(GetSelectedCount() > 0);
}

BEGIN_MESSAGE_MAP(CTraceList, CMFCListCtrl)
	ON_WM_CONTEXTMENU()
	ON_COMMAND(ID_EDIT_COPY, OnEditCopy)
	ON_UPDATE_COMMAND_UI(ID_EDIT_COPY, OnUpdateEditCopy)
	ON_COMMAND(ID_EDIT_CLEAR, OnEditClear)
END_MESSAGE_MAP()

