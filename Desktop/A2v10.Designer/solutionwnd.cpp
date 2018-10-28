
#include "stdafx.h"
#include "A2v10.Designer.h"
#include "Resource.h"

#include "MainFrm.h"
#include "solutionwnd.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#define IMAGE_SOLUTION 0
#define IMAGE_FOLDER   1
#define IMAGE_FOLDER_OPEN 2
#define IMAGE_TABLE    3
#define IMAGE_COLUMN   4
#define IMAGE_DOCUMENT 5
#define IMAGE_DETAILS  6
#define IMAGE_FORM     7
#define IMAGE_VIEW     8
#define IMAGE_ENDPOINT 9

#define MASK_COLUMNS	0x01

const LPCWSTR szNameProp = L"Name";
//TODO:IDS_SOLUTION_FILTER
const LPCWSTR szStrFilter = L"A2 solution files (*.json)|*.json||";

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

BEGIN_MESSAGE_MAP(CSolutionTree, CTreeCtrl)
	ON_MESSAGE(WMI_FILL_PROPS, OnWmiFillProps)
	ON_MESSAGE(WMI_PROPERTY_CHANGED, OnWmiPropertyChanged)
END_MESSAGE_MAP()


CSolutionWnd::CSolutionWnd()
	: m_hTables(NULL), m_hViews(NULL), m_hModels(NULL),
	m_bPropsCreated(false), m_bLoaded(false), m_bModified(false)
{
	m_wndToolBar.SetUpdateCmdUIByOwner(TRUE);
	m_nCurrSort = ID_SORTING_GROUPBYTYPE;
}

CSolutionWnd::~CSolutionWnd()
{
}

BEGIN_MESSAGE_MAP(CSolutionWnd, CA2DockablePane)
	ON_WM_SETFOCUS()
	ON_WM_CREATE()
	ON_WM_SIZE()
	ON_WM_CONTEXTMENU()
	ON_COMMAND(ID_CLASS_ADD_MEMBER_FUNCTION, OnClassAddMemberFunction)
	ON_COMMAND(ID_CLASS_ADD_MEMBER_VARIABLE, OnClassAddMemberVariable)
	ON_COMMAND(ID_SOLUTION_ADD_TABLE, OnAddTable)
	ON_COMMAND(ID_CLASS_PROPERTIES, OnClassProperties)
	ON_COMMAND(ID_NEW_FOLDER, OnNewFolder)
	ON_COMMAND_RANGE(ID_SORTING_GROUPBYTYPE, ID_SORTING_SORTBYACCESS, OnSort)
	ON_UPDATE_COMMAND_UI_RANGE(ID_SORTING_GROUPBYTYPE, ID_SORTING_SORTBYACCESS, OnUpdateSort)
END_MESSAGE_MAP()

/////////////////////////////////////////////////////////////////////////////
// CSolutionWnd message handlers

int CSolutionWnd::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;

	CRect rectDummy;
	rectDummy.SetRectEmpty();

	// Create view:
	const DWORD dwViewStyle = WS_CHILD | WS_VISIBLE |
		WS_CLIPSIBLINGS | WS_CLIPCHILDREN |
		TVS_HASBUTTONS | TVS_INFOTIP |
		TVS_NOHSCROLL | TVS_SHOWSELALWAYS | TVS_FULLROWSELECT;

	if (!m_wndTree.Create(dwViewStyle, rectDummy, this, 2))
	{
		TRACE0("Failed to create Class View\n");
		return -1;      // fail to create
	}


	DWORD dwExStyle = TVS_EX_DOUBLEBUFFER |
		TVS_EX_AUTOHSCROLL; // | TVS_EX_FADEINOUTEXPANDOS |
							//TVS_EX_FADEINOUTEXPANDOS | TVS_EX_DRAWIMAGEASYNC | TVS_EX_NOINDENTSTATE;

	TreeView_SetExtendedStyle(m_wndTree.GetSafeHwnd(), dwExStyle, dwExStyle);

	// Load images:
	if (!m_wndToolBar.Create(this, AFX_DEFAULT_TOOLBAR_STYLE, IDR_SOLUTION))
	{
		TRACE0("Failed to create Solution Window Toolbar\n");
		return -1;
	}
	m_wndToolBar.LoadToolBar(IDR_SOLUTION, 0, 0, TRUE /* Is locked */);

	OnChangeVisualStyle();

	m_wndToolBar.SetPaneStyle(m_wndToolBar.GetPaneStyle() | CBRS_TOOLTIPS | CBRS_FLYBY);
	m_wndToolBar.SetPaneStyle(m_wndToolBar.GetPaneStyle() & ~(CBRS_GRIPPER | CBRS_SIZE_DYNAMIC | CBRS_BORDER_TOP | CBRS_BORDER_BOTTOM | CBRS_BORDER_LEFT | CBRS_BORDER_RIGHT));

	m_wndToolBar.SetOwner(this);

	// All commands will be routed via this control , not via the parent frame:
	m_wndToolBar.SetRouteCommandsViaFrame(FALSE);

	CMenu menuSort;
	menuSort.LoadMenu(IDM_POPUP_SOLUTION);

	m_wndToolBar.ReplaceButton(ID_SOLUTION_ADD, CSolutionWndMenuButton(menuSort.GetSubMenu(IDM_POPUP_SOLUTION_ADD_INDEX)->GetSafeHmenu()));

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
	CTreeCtrl* pWndTree = (CTreeCtrl*)&m_wndTree;
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
	m_wndTree.SetWindowPos(NULL, rectClient.left, rectClient.top + cyTlb, rectClient.Width(), rectClient.Height() - cyTlb, SWP_NOACTIVATE | SWP_NOZORDER);
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

void CSolutionWnd::OnAddTable()
{
	AfxMessageBox(L"Add Table");
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
	m_wndTree.SetFocus();
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

	m_wndTree.SetImageList(&m_ClassViewImages, TVSIL_NORMAL);

	m_wndToolBar.CleanUpLockedImages();
	m_wndToolBar.LoadBitmap(IDB_SORT_24, 0, 0, TRUE /* Locked */);
}

void CSolutionWnd::InsertCollection(JavaScriptValue& collection, HTREEITEM hRoot, int iImage, DWORD mask)
{
	if (collection.ValueType() != JsValueType::JsArray)
		return;
	// while is defined
	for (int i = 0; true; i++) 
	{
		auto elem = collection.GetIndexedProperty(i);
		if (elem.ValueType() == JsValueType::JsUndefined)
			break;
		auto name = elem.GetProperty(m_namePropertyId);
		HTREEITEM hItem = m_wndTree.InsertItem(
			TVIF_TEXT | TVIF_PARAM | TVIF_IMAGE | TVIF_SELECTEDIMAGE,
			name.ToString(),
			iImage, iImage, 0, 0,
			reinterpret_cast<DWORD_PTR>((JsValueRef)elem),
			hRoot, TVI_LAST);
		if (mask & MASK_COLUMNS) 
		{
			auto columns = elem.GetProperty(m_columnsPropertyId);
			InsertCollection(columns, hItem, IMAGE_COLUMN, 0);
		}
	}
}

void CSolutionWnd::CreatePropertyIds()
{
	if (m_bPropsCreated)
		return;
	m_namePropertyId = JavaScriptPropertyId::FromString(szNameProp);
	m_columnsPropertyId = JavaScriptPropertyId::FromString(L"Columns");
}


void CSolutionWnd::LoadSolution(LPCWSTR path)
{
	m_path = path;
	try 
	{
		CreatePropertyIds();
		LoadSolutionImpl();
		m_bLoaded = true;
	}
	catch (JavaScriptException& ex)
	{
		ex.ReportError();
		m_bLoaded = false;
	}
}

void CSolutionWnd::LoadSolutionImpl()
{
	CloseSolution();
	auto root = JavaScriptValue::GlobalObject().GetPropertyChain(L"designer.solution._root_");
	auto name = root.GetProperty(m_namePropertyId).ToString();

	HTREEITEM hRoot = m_wndTree.InsertItem(
		TVIF_TEXT | TVIF_PARAM | TVIF_IMAGE | TVIF_SELECTEDIMAGE | TVIF_STATE,
		name,
		IMAGE_SOLUTION, IMAGE_SOLUTION, 
		TVIS_EXPANDED, TVIS_EXPANDED,
		reinterpret_cast<DWORD_PTR>((JsValueRef) root),
		TVI_ROOT, TVI_LAST);

	// TODO: localization
	HTREEITEM hTables = m_wndTree.InsertItem(L"Tables", IMAGE_FOLDER, IMAGE_FOLDER, hRoot);
	auto tables = root.GetProperty(L"Tables");
	InsertCollection(tables, hTables, IMAGE_TABLE, MASK_COLUMNS);

	// TODO: localization
	HTREEITEM hViews = m_wndTree.InsertItem(L"Views", IMAGE_FOLDER, IMAGE_FOLDER, hRoot);
	auto views = root.GetProperty(L"Views");
	InsertCollection(views, hViews, IMAGE_VIEW, MASK_COLUMNS);

	HTREEITEM hDataModels = m_wndTree.InsertItem(L"Data Models", IMAGE_FOLDER, IMAGE_FOLDER, hRoot);

	HTREEITEM hEndPoints = m_wndTree.InsertItem(L"Endpoints", IMAGE_FOLDER, IMAGE_FOLDER, hRoot);
	auto endPoints = root.GetProperty(L"Endpoints");
	InsertDirectories(endPoints, hEndPoints, IMAGE_ENDPOINT, MASK_COLUMNS);

	/*

	auto root = JavaScriptValue::GlobalObject().GetProperty(L"app").GetProperty(L"solution");
	if (!root.IsValid())
		return;
	auto namePropId = JavaScriptPropertyId::FromString(L"name");

	AfxMessageBox(L"load success!");
	// _T("Solution 'A2v10.Start' (2 modules)"
	HTREEITEM hRoot = m_wndTree.InsertItem(
		TVIF_TEXT|TVIF_PARAM|TVIF_IMAGE|TVIF_SELECTEDIMAGE,
		root.GetProperty(namePropId).ToString(), 
		IMAGE_SOLUTION, IMAGE_SOLUTION, 0, 0, 
		reinterpret_cast<DWORD_PTR>(pSol->GetJsHandle()), 
		TVI_ROOT, TVI_LAST);

	//m_wndTree.SetItemState(hRoot, TVIS_BOLD, TVIS_BOLD);
	HTREEITEM hCatalogs = m_wndTree.InsertItem(L"Catalogs", IMAGE_FOLDER, IMAGE_FOLDER, hRoot);
	auto catalogs = root.GetProperty(L"catalogs");
	InsertCollection(catalogs, hCatalogs, IMAGE_CATALOG, MASK_FIELDS|MASK_DETAILS|MASK_FORMS);

	HTREEITEM hDocuments = m_wndTree.InsertItem(L"Documents", IMAGE_FOLDER, IMAGE_FOLDER, hRoot);
	auto documents = root.GetProperty(L"documents");
	InsertCollection(documents, hDocuments, IMAGE_DOCUMENT, MASK_FIELDS | MASK_DETAILS | MASK_FORMS);

	*/
	m_wndTree.Expand(hRoot, TVE_EXPAND);
}

void CSolutionWnd::InsertDirectories(JavaScriptValue& collection, HTREEITEM hRoot, int iImage, DWORD mask)
{
	if (m_path.IsEmpty())
		return;
}


void CSolutionWnd::CloseSolution()
{
	m_wndTree.DeleteAllItems();
	// TODO: // destory js elements
	bool bWasLoaded = m_bLoaded;

	m_bLoaded = false;
	m_strFilePath.Empty();

	if (bWasLoaded) {
		AfxGetMainWnd()->SendMessageToDescendants(WMI_NOTIFY, WMIN_SOLUTION_CLOSED, 0L);
	}
}

// afx_msg
LRESULT CSolutionTree::OnWmiFillProps(WPARAM wParam, LPARAM lParam)
{
	if (wParam != WMI_FILL_PROPS_WPARAM)
		return 0L;
	HTREEITEM hItem = GetSelectedItem();
	if (hItem == NULL)
		return (LRESULT)WMI_FILL_PROPS_RESULT_EMPTY;
	DWORD_PTR dwData = GetItemData(hItem);
	if (dwData == 0)
		return (LRESULT)WMI_FILL_PROPS_RESULT_EMPTY;
	FILL_PROPS_INFO* pInfo = reinterpret_cast<FILL_PROPS_INFO*>(lParam);
	pInfo->elem = dwData;
	pInfo->parent = 0;
	pInfo->elemTarget = hItem;
	pInfo->wndTarget = GetSafeHwnd();
	if (m_hItemPropertyChanged) {
		m_hItemPropertyChanged = false;
		return (LRESULT)WMI_FILL_PROPS_RESULT_REFILL;
	}
	return (LRESULT)WMI_FILL_PROPS_RESULT_OK;
}

LRESULT CSolutionTree::OnWmiPropertyChanged(WPARAM wParam, LPARAM lParam)
{
	if (wParam != WMI_PROPERTY_CHANGED_WPARAM)
		return 0L;
	PROPERTY_CHANGED_INFO* pInfo = reinterpret_cast<PROPERTY_CHANGED_INFO*>(lParam);
	if (pInfo == nullptr)
		return 0L;
	if (wcsncmp(pInfo->szPropName, szNameProp, 16) != 0)
		return 0L;
	HTREEITEM hTreeItem = reinterpret_cast<HTREEITEM>(pInfo->pSource);
	JsValueRef jsRef = reinterpret_cast<JsValueRef>(pInfo->pJsRef);
	try {
		JavaScriptValue val(jsRef);
		// TODO: сделать функцию viewName() ???
		CString name = val.GetProperty(szNameProp).ToString();
		SetItemText(hTreeItem, name);
	}
	catch (JavaScriptException& ex) {
		// do nothing
		ex.ReportError();
	}
	return 0L;
}

void CSolutionWnd::DoSave()
{
	try {
		auto solution = JavaScriptValue::GlobalObject().GetPropertyChain(L"designer.solution");
		auto loadFunc = solution.GetProperty(L"__saveSolution");
		if (loadFunc.ValueType() == JsValueType::JsFunction) {
			JavaScriptValue result = loadFunc.CallFunction(solution, JavaScriptValue::FromString(L""));
			if (SaveSolution(result.ToString()))
				m_bModified = false;
		}
	}
	catch (JavaScriptException& ex) {
		ex.ReportError();
	}
}

void CSolutionWnd::DoLoad()
{
	CFileDialog dlg(TRUE, NULL, NULL,
		OFN_FILEMUSTEXIST | OFN_EXPLORER | OFN_PATHMUSTEXIST | OFN_HIDEREADONLY | OFN_ENABLESIZING,
		szStrFilter);
	if (dlg.DoModal() != IDOK)
		return;
	CString strPath = dlg.GetPathName();
	// static 
	CString jsonText;
	if (!CFileTools::LoadFile(strPath, jsonText)) {
		AfxMessageBox(L"Can't load solution file");
	}

	//AddToRecentFileList(strPath);

	try
	{
		auto solution = JavaScriptValue::GlobalObject().GetPropertyChain(L"designer.solution");
		auto loadFunc = solution.GetProperty(L"__loadSolution");
		if (loadFunc.ValueType() == JsValueType::JsFunction)
			loadFunc.CallFunction(solution, JavaScriptValue::FromString((LPCWSTR)jsonText));
		LoadSolution(strPath);
		AfxGetMainWnd()->SendMessageToDescendants(WMI_NOTIFY, WMIN_SOLUTION_OPENED, 0L);
	}
	catch (JavaScriptException& ex)
	{
		ex.ReportError();
	}
	if (IsLoaded())
		m_strFilePath = strPath;
}

void CSolutionWnd::DoCreate(LPCWSTR szFolder, LPCWSTR szName)
{
	// TODO: check is modified
	try
	{
		// load empty solution
		auto solution = JavaScriptValue::GlobalObject().GetPropertyChain(L"designer.solution");
		auto loadFunc = solution.GetProperty(L"__loadSolution");
		if (loadFunc.ValueType() == JsValueType::JsFunction) {
			// TODO: spec symbols!!!!
			CString nameJS;
			nameJS.Format(L"{\"Name\": \"%s\"}", szName);
			loadFunc.CallFunction(solution, JavaScriptValue::FromString(nameJS));
		}
		LoadSolution(NULL);
		AfxGetMainWnd()->SendMessageToDescendants(WMI_NOTIFY, WMIN_SOLUTION_OPENED, 0L);
	}
	catch (JavaScriptException& ex)
	{
		ex.ReportError();
	}
}

void CSolutionWnd::DoClose()
{
	CloseSolution();
}

bool CSolutionWnd::IsLoaded()
{
	return m_bLoaded;
}

bool CSolutionWnd::SaveSolution(LPCWSTR szJsonText)
{
	CString pathToSave = m_strFilePath;
	if (pathToSave.IsEmpty()) {
		// TODO: Ask user for file name;
		CFileDialog dlg(FALSE, L"json", L"solution",
			OFN_HIDEREADONLY | OFN_OVERWRITEPROMPT | OFN_EXPLORER | OFN_ENABLESIZING,
			szStrFilter);
		if (dlg.DoModal() != IDOK)
			return false;
		pathToSave = dlg.GetPathName();
	}
	if (!CFileTools::SaveFileUTF8(pathToSave, szJsonText))
		return false;
	m_strFilePath = pathToSave;
	return true;
}