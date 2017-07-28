
#include "stdafx.h"
#include "A2v10.Designer.h"
#include "Resource.h"

#include "MainFrm.h"
#include "solutionwnd.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#define IMAGE_SOLUTION 0
#define IMAGE_FOLDER 1
#define IMAGE_FOLDER_OPEN 2
#define IMAGE_CATALOG 3
#define IMAGE_FIELD 4
#define IMAGE_DOCUMENT 5
#define IMAGE_DETAILS 6
#define IMAGE_FORM 7

#define MASK_FIELDS		0x01
#define MASK_DETAILS	0x02
#define MASK_FORMS		0x04

class CSolutionWndMenuButton : public CMFCToolBarMenuButton
{
	friend class CSolutionWnd;

	DECLARE_SERIAL(CSolutionWndMenuButton)

public:
	CSolutionWndMenuButton(HMENU hMenu = NULL) : CMFCToolBarMenuButton((UINT)-1, hMenu, -1)
	{
	}

	virtual void OnDraw(CDC* pDC, const CRect& rect, CMFCToolBarImages* pImages, BOOL bHorz = TRUE,
		BOOL bCustomizeMode = FALSE, BOOL bHighlight = FALSE, BOOL bDrawBorder = TRUE, BOOL bGrayDisabledButtons = TRUE)
	{
		pImages = CMFCToolBar::GetImages();

		CAfxDrawState ds;
		pImages->PrepareDrawImage(ds);

		CMFCToolBarMenuButton::OnDraw(pDC, rect, pImages, bHorz, bCustomizeMode, bHighlight, bDrawBorder, bGrayDisabledButtons);

		pImages->EndDrawImage(ds);
	}
};

IMPLEMENT_SERIAL(CSolutionWndMenuButton, CMFCToolBarMenuButton, 1)

//////////////////////////////////////////////////////////////////////
// Construction/Destruction
//////////////////////////////////////////////////////////////////////

CSolutionWnd::CSolutionWnd()
{
	m_wndToolBar.SetUpdateCmdUIByOwner(TRUE);
	m_nCurrSort = ID_SORTING_GROUPBYTYPE;
}

CSolutionWnd::~CSolutionWnd()
{
}

BEGIN_MESSAGE_MAP(CSolutionWnd, CA2DockablePane)
	ON_MESSAGE(WMI_PROPERTY_CHANGED, OnWmiPropertyChanged)
	ON_WM_SETFOCUS()
	ON_WM_CREATE()
	ON_WM_SIZE()
	ON_WM_CONTEXTMENU()
	ON_COMMAND(ID_CLASS_ADD_MEMBER_FUNCTION, OnClassAddMemberFunction)
	ON_COMMAND(ID_CLASS_ADD_MEMBER_VARIABLE, OnClassAddMemberVariable)
	ON_COMMAND(ID_CLASS_DEFINITION, OnClassDefinition)
	ON_COMMAND(ID_CLASS_PROPERTIES, OnClassProperties)
	ON_COMMAND(ID_NEW_FOLDER, OnNewFolder)
	ON_COMMAND_RANGE(ID_SORTING_GROUPBYTYPE, ID_SORTING_SORTBYACCESS, OnSort)
	ON_UPDATE_COMMAND_UI_RANGE(ID_SORTING_GROUPBYTYPE, ID_SORTING_SORTBYACCESS, OnUpdateSort)
	ON_MESSAGE(WMI_NOTIFY, OnWmiNotify)
END_MESSAGE_MAP()

/////////////////////////////////////////////////////////////////////////////
// CSolutionWnd message handlers

int CSolutionWnd::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;

	CRect rectDummy;
	rectDummy.SetRectEmpty();

	// Create views:
	const DWORD dwViewStyle = WS_CHILD | WS_VISIBLE |
		WS_CLIPSIBLINGS | WS_CLIPCHILDREN |
		TVS_HASBUTTONS | TVS_INFOTIP |
		TVS_NOHSCROLL | TVS_SHOWSELALWAYS | TVS_FULLROWSELECT;

	if (!m_wndClassView.Create(dwViewStyle, rectDummy, this, 2))
	{
		TRACE0("Failed to create Class View\n");
		return -1;      // fail to create
	}


	DWORD dwExStyle = TVS_EX_DOUBLEBUFFER |
		TVS_EX_AUTOHSCROLL; // | TVS_EX_FADEINOUTEXPANDOS |
							//TVS_EX_FADEINOUTEXPANDOS | TVS_EX_DRAWIMAGEASYNC | TVS_EX_NOINDENTSTATE;

	TreeView_SetExtendedStyle(m_wndClassView.GetSafeHwnd(), dwExStyle, dwExStyle);

	// Load images:
	m_wndToolBar.Create(this, AFX_DEFAULT_TOOLBAR_STYLE, IDR_SORT);
	m_wndToolBar.LoadToolBar(IDR_SORT, 0, 0, TRUE /* Is locked */);

	OnChangeVisualStyle();

	m_wndToolBar.SetPaneStyle(m_wndToolBar.GetPaneStyle() | CBRS_TOOLTIPS | CBRS_FLYBY);
	m_wndToolBar.SetPaneStyle(m_wndToolBar.GetPaneStyle() & ~(CBRS_GRIPPER | CBRS_SIZE_DYNAMIC | CBRS_BORDER_TOP | CBRS_BORDER_BOTTOM | CBRS_BORDER_LEFT | CBRS_BORDER_RIGHT));

	m_wndToolBar.SetOwner(this);

	// All commands will be routed via this control , not via the parent frame:
	m_wndToolBar.SetRouteCommandsViaFrame(FALSE);

	CMenu menuSort;
	menuSort.LoadMenu(IDR_POPUP_SORT);

	m_wndToolBar.ReplaceButton(ID_SORT_MENU, CSolutionWndMenuButton(menuSort.GetSubMenu(0)->GetSafeHmenu()));

	CSolutionWndMenuButton* pButton =  DYNAMIC_DOWNCAST(CSolutionWndMenuButton, m_wndToolBar.GetButton(0));

	if (pButton != NULL)
	{
		pButton->m_bText = FALSE;
		pButton->m_bImage = TRUE;
		pButton->SetImage(GetCmdMgr()->GetCmdImage(ID_FILE_OPEN /*m_nCurrSort*/));
		pButton->SetMessageWnd(this);
	}

	return 0;
}

void CSolutionWnd::OnSize(UINT nType, int cx, int cy)
{
	__super::OnSize(nType, cx, cy);
	AdjustLayout();
}


void CSolutionWnd::OnContextMenu(CWnd* pWnd, CPoint point)
{
	CTreeCtrl* pWndTree = (CTreeCtrl*)&m_wndClassView;
	ASSERT_VALID(pWndTree);

	if (pWnd != pWndTree)
	{
		__super::OnContextMenu(pWnd, point);
		return;
	}

	if (point != CPoint(-1, -1))
	{
		// Select clicked item:
		CPoint ptTree = point;
		pWndTree->ScreenToClient(&ptTree);

		UINT flags = 0;
		HTREEITEM hTreeItem = pWndTree->HitTest(ptTree, &flags);
		if (hTreeItem != NULL)
		{
			pWndTree->SelectItem(hTreeItem);
		}
	}

	pWndTree->SetFocus();
	CMenu menu;
	menu.LoadMenu(IDR_POPUP_SORT);

	CMenu* pSumMenu = menu.GetSubMenu(0);

	if (AfxGetMainWnd()->IsKindOf(RUNTIME_CLASS(CMDIFrameWndEx)))
	{
		CMFCPopupMenu* pPopupMenu = new CMFCPopupMenu;

		if (!pPopupMenu->Create(this, point.x, point.y, (HMENU)pSumMenu->m_hMenu, FALSE, TRUE))
			return;

		((CMDIFrameWndEx*)AfxGetMainWnd())->OnShowPopupMenu(pPopupMenu);
		UpdateDialogControls(this, FALSE);
	}
}

void CSolutionWnd::AdjustLayout()
{
	if (!GetSafeHwnd())
		return;

	CRect rectClient;
	GetClientRect(rectClient);
	AdjustBorder(rectClient); // !!!

	int cyTlb = m_wndToolBar.CalcFixedLayout(FALSE, TRUE).cy;

	m_wndToolBar.SetWindowPos(NULL, rectClient.left, rectClient.top, rectClient.Width(), cyTlb, SWP_NOACTIVATE | SWP_NOZORDER);
	m_wndClassView.SetWindowPos(NULL, rectClient.left, rectClient.top + cyTlb, rectClient.Width(), rectClient.Height() - cyTlb, SWP_NOACTIVATE | SWP_NOZORDER);
}

BOOL CSolutionWnd::PreTranslateMessage(MSG* pMsg)
{
	return __super::PreTranslateMessage(pMsg);
}

void CSolutionWnd::OnSort(UINT id)
{
	if (m_nCurrSort == id)
	{
		return;
	}

	m_nCurrSort = id;

	CSolutionWndMenuButton* pButton =  DYNAMIC_DOWNCAST(CSolutionWndMenuButton, m_wndToolBar.GetButton(0));

	if (pButton != NULL)
	{
		pButton->SetImage(GetCmdMgr()->GetCmdImage(id));
		m_wndToolBar.Invalidate();
		m_wndToolBar.UpdateWindow();
	}
}

void CSolutionWnd::OnUpdateSort(CCmdUI* pCmdUI)
{
	pCmdUI->SetCheck(pCmdUI->m_nID == m_nCurrSort);
}

void CSolutionWnd::OnClassAddMemberFunction()
{
	AfxMessageBox(_T("Add member function..."));
}

void CSolutionWnd::OnClassAddMemberVariable()
{
	// TODO: Add your command handler code here
}

void CSolutionWnd::OnClassDefinition()
{
	// TODO: Add your command handler code here
}

void CSolutionWnd::OnClassProperties()
{
	// TODO: Add your command handler code here
}

void CSolutionWnd::OnNewFolder()
{
	AfxMessageBox(_T("New Folder..."));
}

void CSolutionWnd::OnSetFocus(CWnd* pOldWnd)
{
	__super::OnSetFocus(pOldWnd);
	m_wndClassView.SetFocus();
}

void CSolutionWnd::OnChangeVisualStyle()
{
	m_ClassViewImages.DeleteImageList();

	CBitmap bmp;

	if (!bmp.LoadBitmap(ID_WND_SOLUTION))
	{
		ATLTRACE(L"Can't load bitmap: %x\n", ID_WND_SOLUTION);
		ASSERT(FALSE);
		return;
	}

	BITMAP bmpObj;
	bmp.GetBitmap(&bmpObj);

	UINT nFlags = ILC_MASK | ILC_COLOR24;

	m_ClassViewImages.Create(16, bmpObj.bmHeight, nFlags, 0, 0);
	m_ClassViewImages.Add(&bmp, RGB(255, 0, 255));

	m_wndClassView.SetImageList(&m_ClassViewImages, TVSIL_NORMAL);

	m_wndToolBar.CleanUpLockedImages();
	m_wndToolBar.LoadBitmap(IDB_SORT_24, 0, 0, TRUE /* Locked */);
}

/*
void CSolutionWnd::InsertCollection(JavaScriptValue& collection, HTREEITEM hRoot, int iImage, DWORD mask)
{
	if (collection.ValueType() != JsValueType::JsObject)
		return;
	CArray<CString, LPCWSTR> list;
	collection.PropertyNames(list);
	for (int i = 0; i < list.GetSize(); i++) {
		LPCWSTR szName = list.GetAt(i);
		auto item = collection.GetProperty(szName);
		HTREEITEM hItem = m_wndClassView.InsertItem(
			TVIF_TEXT | TVIF_PARAM | TVIF_IMAGE | TVIF_SELECTEDIMAGE,
			CStringTools::ToPascalCase(szName),
			iImage, iImage, 0, 0,
			reinterpret_cast<DWORD_PTR>((JsValueRef)item),
			hRoot, TVI_LAST);
		if (mask & MASK_FIELDS) {
			HTREEITEM hFields = m_wndClassView.InsertItem(L"Fields", IMAGE_FOLDER, IMAGE_FOLDER, hItem);
			auto fields = item.GetProperty(L"fields");
			InsertCollection(fields, hFields, IMAGE_FIELD, 0);
		}
		if (mask & MASK_DETAILS) {
			HTREEITEM hDetails = m_wndClassView.InsertItem(L"Details", IMAGE_FOLDER, IMAGE_FOLDER, hItem);
			auto details = item.GetProperty(L"details");
			InsertCollection(details, hDetails, IMAGE_DETAILS, MASK_FIELDS);
		}
		if (mask & MASK_FORMS) {
			HTREEITEM hForms = m_wndClassView.InsertItem(L"Forms", IMAGE_FOLDER, IMAGE_FOLDER, hItem);
			auto forms = item.GetProperty(L"forms");
			InsertCollection(forms, hForms, IMAGE_FORM, 0);
		}
	}
}
*/

void CSolutionWnd::LoadSolution()
{
	CloseSolution();

	//if (!CXDataSource::IsOpenDS())
	//return;

	//CXDataSource ds;
	//ds.LoadSolution();
	/*
	CSolution* pSol = theApp.m_pSolution;
	ATLASSERT(pSol);
	pSol->AddEventTarget(GetSafeHwnd());


	auto root = JavaScriptValue::GlobalObject().GetProperty(L"app").GetProperty(L"solution");
	if (!root.IsValid())
		return;
	auto namePropId = JavaScriptPropertyId::FromString(L"name");

	AfxMessageBox(L"load success!");
	// _T("Solution 'A2v10.Start' (2 modules)"
	HTREEITEM hRoot = m_wndClassView.InsertItem(
		TVIF_TEXT|TVIF_PARAM|TVIF_IMAGE|TVIF_SELECTEDIMAGE,
		root.GetProperty(namePropId).ToString(), 
		IMAGE_SOLUTION, IMAGE_SOLUTION, 0, 0, 
		reinterpret_cast<DWORD_PTR>(pSol->GetJsHandle()), 
		TVI_ROOT, TVI_LAST);

	//m_wndClassView.SetItemState(hRoot, TVIS_BOLD, TVIS_BOLD);
	HTREEITEM hCatalogs = m_wndClassView.InsertItem(L"Catalogs", IMAGE_FOLDER, IMAGE_FOLDER, hRoot);
	auto catalogs = root.GetProperty(L"catalogs");
	InsertCollection(catalogs, hCatalogs, IMAGE_CATALOG, MASK_FIELDS|MASK_DETAILS|MASK_FORMS);

	HTREEITEM hDocuments = m_wndClassView.InsertItem(L"Documents", IMAGE_FOLDER, IMAGE_FOLDER, hRoot);
	auto documents = root.GetProperty(L"documents");
	InsertCollection(documents, hDocuments, IMAGE_DOCUMENT, MASK_FIELDS | MASK_DETAILS | MASK_FORMS);

	HTREEITEM hJournals = m_wndClassView.InsertItem(L"Journals", IMAGE_FOLDER, IMAGE_FOLDER, hRoot);
	HTREEITEM hEnums = m_wndClassView.InsertItem(L"Enums", IMAGE_FOLDER, IMAGE_FOLDER, hRoot);
	HTREEITEM hModules = m_wndClassView.InsertItem(L"Modules", IMAGE_FOLDER, IMAGE_FOLDER, hRoot);

	m_wndClassView.Expand(hRoot, TVE_EXPAND);

	/**
	HTREEITEM hClass = m_wndClassView.InsertItem(_T("CFakeAboutDlg"), IMAGE_FOLDER, IMAGE_FOLDER, hRoot);
	m_wndClassView.InsertItem(_T("CFakeAboutDlg()"), 3, 3, hClass);


	hClass = m_wndClassView.InsertItem(_T("CFakeApp"), 1, 1, hRoot);
	m_wndClassView.InsertItem(_T("CFakeApp()"), 3, 3, hClass);
	m_wndClassView.InsertItem(_T("InitInstance()"), 3, 3, hClass);
	m_wndClassView.InsertItem(_T("OnAppAbout()"), 3, 3, hClass);

	hClass = m_wndClassView.InsertItem(_T("CFakeAppDoc"), 1, 1, hRoot);
	m_wndClassView.InsertItem(_T("CFakeAppDoc()"), 4, 4, hClass);
	m_wndClassView.InsertItem(_T("~CFakeAppDoc()"), 3, 3, hClass);
	m_wndClassView.InsertItem(_T("OnNewDocument()"), 3, 3, hClass);

	hClass = m_wndClassView.InsertItem(_T("CFakeAppView"), 1, 1, hRoot);
	m_wndClassView.InsertItem(_T("CFakeAppView()"), 4, 4, hClass);
	m_wndClassView.InsertItem(_T("~CFakeAppView()"), 3, 3, hClass);
	m_wndClassView.InsertItem(_T("GetDocument()"), 3, 3, hClass);
	m_wndClassView.Expand(hClass, TVE_EXPAND);

	hClass = m_wndClassView.InsertItem(_T("CFakeAppFrame"), 1, 1, hRoot);
	m_wndClassView.InsertItem(_T("CFakeAppFrame()"), 3, 3, hClass);
	m_wndClassView.InsertItem(_T("~CFakeAppFrame()"), 3, 3, hClass);
	m_wndClassView.InsertItem(_T("m_wndMenuBar"), 6, 6, hClass);
	m_wndClassView.InsertItem(_T("m_wndToolBar"), 6, 6, hClass);
	m_wndClassView.InsertItem(_T("m_wndStatusBar"), 6, 6, hClass);

	hClass = m_wndClassView.InsertItem(_T("Globals"), 2, 2, hRoot);
	m_wndClassView.InsertItem(_T("theFakeApp"), 5, 5, hClass);
	m_wndClassView.Expand(hClass, TVE_EXPAND);
	*/
}

void CSolutionWnd::CloseSolution()
{
	m_wndClassView.DeleteAllItems();
}

// afx_msg
LRESULT CSolutionWnd::OnWmiNotify(WPARAM wParam, LPARAM lParam)
{
	switch (wParam) {
	case WMIN_OPEN_SOLUTION:
		//try 
		//{
			LoadSolution();
		//}
		/*
		catch (JavaScriptException& e) {
			e.ReportError();
		}
		*/
		break;
	case  WMIN_SOLUTION_CLOSED:
		CloseSolution();
		break;
	}
	return 0L;
}

LRESULT CSolutionWnd::OnWmiPropertyChanged(WPARAM wParam, LPARAM lParam)
{
	if (wParam != WMI_PROPERTY_CHANGED_WPARAM)
		return 0L;
	PROPERTY_CHANGED_INFO* pInfo = reinterpret_cast<PROPERTY_CHANGED_INFO*>(lParam);
	if (pInfo == nullptr)
		return 0L;
	if (wcsncmp(pInfo->szPropName, L"name", 16) != 0)
		return 0L;
	/*
	LPARAM lRef = reinterpret_cast<LPARAM>(pInfo->pJsRef);
	JavaScriptValue val(pInfo->pJsRef);
	CString name = val.GetProperty(L"name").ToString();
	HTREEITEM hItem = m_wndClassView.FindItem(lRef);
	if (hItem)
		m_wndClassView.SetItemText(hItem, name);
	*/
	return 0L;
}