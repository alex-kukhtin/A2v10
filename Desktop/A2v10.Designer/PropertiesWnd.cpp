
#include "stdafx.h"

#include "PropertiesWnd.h"
#include "Resource.h"
#include "MainFrm.h"
#include "A2v10.Designer.h"

#ifdef _DEBUG
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#define new DEBUG_NEW
#endif


#define DEFAULT_CATEGORY L"Misc"

#define AUTO_COLOR RGB(242, 242, 242)
#define VT_TAG 10000

// virtual 
CString CA2PropertyGridProperty::FormatProperty()
{
	COleVariant& var = m_varValue;
	if (V_VT(&var) == VT_R8)
		return CConvert::Double2String(V_R8(&var));
	return __super::FormatProperty();
}

static void __InsertSorted(CList<CMFCPropertyGridProperty*, CMFCPropertyGridProperty*>& list, CMFCPropertyGridProperty* pProp)
{
	POSITION pos = list.GetHeadPosition();
	while (pos) {
		CMFCPropertyGridProperty* pChild = list.GetAt(pos);
		if (pProp->GetName() < pChild->GetName()) {
			list.InsertBefore(pos, pProp);
			return;
		}
		list.GetNext(pos);
	}
	list.AddTail(pProp);
}

class CUPMFCPropertyGridProperty : public CMFCPropertyGridProperty
{
	friend class CA2PropertyGridProperty;
};

BOOL CA2PropertyGridProperty::AddSubItemSorted(CMFCPropertyGridProperty* pProp)
{
	ASSERT_VALID(this);
	ASSERT_VALID(pProp);
	CUPMFCPropertyGridProperty* pPropUP = reinterpret_cast<CUPMFCPropertyGridProperty*>(pProp);
	if (!IsGroup())
	{
		ASSERT(FALSE);
		return FALSE;
	}

	pPropUP->m_pParent = this;

	__InsertSorted(m_lstSubItems, pProp);
	pPropUP->m_pWndList = m_pWndList;

	return TRUE;
}

// virtual 
void CA2PropertyGridCtrl::OnPropertyChanged(CMFCPropertyGridProperty* pProp) const
{
	LPCWSTR propName = pProp->GetName();

	DWORD dwData = pProp->GetData();
	bool bAttached = false;
	if (dwData >= VT_TAG) {
		dwData -= VT_TAG;
		bAttached = true;
	}

	COleVariant var = pProp->GetValue();

	JavaScriptValue val;

	switch (dwData) {
	case VT_R8:
		val = JavaScriptValue::FromDouble(V_R8(&var));
		break;
	case VT_BSTR:
		val = JavaScriptValue::FromString(V_BSTR(&var));
		break;
	case VT_BOOL:
		val = JavaScriptValue::FromBool(V_BOOL(&var) ? true : false);
		break;
	case VT_COLOR:
	{
		CMFCPropertyGridColorProperty* pColorProp = DYNAMIC_DOWNCAST(CMFCPropertyGridColorProperty, pProp);
		COLORREF clr = pColorProp->GetColor();
		if (clr == UNKNOWN_COLOR)
			clr = AUTO_COLOR;
		val = JavaScriptValue::FromString(CConvert::Color2String(clr));
	}
	break;
	default:
		ATLASSERT(FALSE);
		return;
	};
	CA2PropertyGridCtrl* pThis = const_cast<CA2PropertyGridCtrl*>(this);
	/*
	if (bAttached) {
		CString funcName(propName);
		JavaScriptValue propAccessor = pThis->m_jsValueParent.GetProperty(L"$$" + funcName);
		propAccessor.CallFunction(pThis->m_jsValueParent, JavaScriptValue::FromString(pThis->m_jsValue.GetHashKey()), val);
	}
	else
	*/
		pThis->SetProperty(propName, val);
}


JavaScriptValue CA2PropertyGridCtrl::GetValue()
{
	JavaScriptValue val;
	if (m_pJsValue != nullptr)
		val = m_pJsValue->GetJsHandle();
	return val;
}

JavaScriptValue CA2PropertyGridCtrl::GetParentValue()
{
	JavaScriptValue val;
	if (m_pJsValueParent != nullptr)
		val = m_pJsValueParent->GetJsHandle();
	return val;
}

void CA2PropertyGridCtrl::SetProperty(LPCWSTR szPropName, JavaScriptValue val)
{
	if (m_pJsValue == nullptr)
		return;
	JavaScriptValue jsValue = m_pJsValue->GetJsHandle();
	jsValue.SetProperty(szPropName, val);
	m_pJsValue->OnPropertyChanged(szPropName); // notify 
}

// virtual
void CA2PropertyGridCtrl::OnDrawDescription(CDC* pDC, CRect rect)
{
	ASSERT_VALID(this);
	ASSERT_VALID(pDC);

	if (m_clrDescriptionBackground != (COLORREF)-1)
	{
		CBrush br(m_clrDescriptionBackground);
		pDC->FillRect(rect, &br);
	}
	else
	{
		pDC->FillRect(rect, m_bControlBarColors ? &(GetGlobalData()->brBarFace) : &(GetGlobalData()->brBtnFace));
	}

	rect.top += AFX_TEXT_MARGIN;

	//COLORREF clrShadow = m_bControlBarColors ? GetGlobalData()->clrBarShadow : GetGlobalData()->clrBtnShadow;
	COLORREF clrShadow = m_clrLine;

	pDC->Draw3dRect(rect, clrShadow, clrShadow);

	if (m_pSel == NULL)
	{
		return;
	}

	rect.DeflateRect(AFX_TEXT_MARGIN, AFX_TEXT_MARGIN);

	ASSERT_VALID(m_pSel);

	COLORREF clrTextOld = (COLORREF)-1;

	if (m_clrDescriptionText != (COLORREF)-1)
	{
		clrTextOld = pDC->SetTextColor(m_clrDescriptionText);
	}

	m_pSel->OnDrawDescription(pDC, rect);

	if (clrTextOld == (COLORREF)-1)
	{
		pDC->SetTextColor(clrTextOld);
	}
}

CPropertiesWnd::CPropertiesWnd()
{
	m_nComboHeight = 0;
	m_wndToolBar.SetUpdateCmdUIByOwner(TRUE);
}

CPropertiesWnd::~CPropertiesWnd()
{
}

BEGIN_MESSAGE_MAP(CPropertiesWnd, CA2DockablePane)
	ON_WM_CREATE()
	ON_WM_SIZE()
	ON_WM_SETFOCUS()
	ON_COMMAND(ID_PROP_ALPHABETICAL, OnAlphabetical)
	ON_UPDATE_COMMAND_UI(ID_PROP_ALPHABETICAL, OnUpdateAlphabetical)
	ON_COMMAND(ID_PROP_CATEGORIZED, OnCategorized)
	ON_UPDATE_COMMAND_UI(ID_PROP_CATEGORIZED, OnUpdateCategorized)
	/* */
	ON_COMMAND(ID_EXPAND_ALL, OnExpandAllProperties)
	ON_UPDATE_COMMAND_UI(ID_EXPAND_ALL, OnUpdateExpandAllProperties)
	ON_MESSAGE(WMI_SETTINGCHANGE, OnWmiSettingChange)
END_MESSAGE_MAP()

/////////////////////////////////////////////////////////////////////////////
// CResourceViewBar message handlers

void CPropertiesWnd::AdjustLayout()
{
	if (GetSafeHwnd() == NULL || (AfxGetMainWnd() != NULL && AfxGetMainWnd()->IsIconic()))
	{
		return;
	}

	CRect rectClient;
	GetClientRect(rectClient);
	AdjustBorder(rectClient);

	int cyTlb = m_wndToolBar.CalcFixedLayout(FALSE, TRUE).cy;

	m_wndObjectCombo.SetWindowPos(NULL, rectClient.left, rectClient.top, rectClient.Width(), m_nComboHeight, SWP_NOACTIVATE | SWP_NOZORDER);
	m_wndToolBar.SetWindowPos(NULL, rectClient.left, rectClient.top + m_nComboHeight, rectClient.Width(), cyTlb, SWP_NOACTIVATE | SWP_NOZORDER);
	m_wndPropList.SetWindowPos(NULL, rectClient.left, rectClient.top + m_nComboHeight + cyTlb, rectClient.Width(), rectClient.Height() - (m_nComboHeight + cyTlb), SWP_NOACTIVATE | SWP_NOZORDER);
}

int CPropertiesWnd::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;

	CRect rectDummy;
	rectDummy.SetRectEmpty();

	// Create combo:
	const DWORD dwViewStyle = WS_CHILD | WS_VISIBLE | CBS_DROPDOWNLIST | WS_BORDER | CBS_SORT | WS_CLIPSIBLINGS | WS_CLIPCHILDREN;

	if (!m_wndObjectCombo.Create(dwViewStyle, rectDummy, this, 1))
	{
		TRACE0("Failed to create Properties Combo \n");
		return -1;      // fail to create
	}

	m_wndObjectCombo.AddString(_T("Application"));
	m_wndObjectCombo.AddString(_T("Properties Window"));
	m_wndObjectCombo.SetCurSel(0);

	CRect rectCombo;
	m_wndObjectCombo.GetClientRect(&rectCombo);

	m_nComboHeight = rectCombo.Height();
	m_nComboHeight -= 1;// MFC BUG

	if (!m_wndPropList.Create(WS_VISIBLE | WS_CHILD, rectDummy, this, 2))
	{
		TRACE0("Failed to create Properties Grid \n");
		return -1;      // fail to create
	}

	InitPropList();

	m_wndToolBar.Create(this, AFX_DEFAULT_TOOLBAR_STYLE, IDR_PROPERTIES);
	VERIFY(m_wndToolBar.LoadToolBar(IDR_PROPERTIES, 0, 0, TRUE /* Is locked */));

	m_wndToolBar.SetPaneStyle(m_wndToolBar.GetPaneStyle() | CBRS_TOOLTIPS | CBRS_FLYBY);
	m_wndToolBar.SetPaneStyle(m_wndToolBar.GetPaneStyle() & ~(CBRS_GRIPPER | CBRS_SIZE_DYNAMIC | CBRS_BORDER_TOP | CBRS_BORDER_BOTTOM | CBRS_BORDER_LEFT | CBRS_BORDER_RIGHT));
	m_wndToolBar.SetOwner(this);

	// All commands will be routed via this control , not via the parent frame:
	m_wndToolBar.SetRouteCommandsViaFrame(FALSE);

	AdjustLayout();
	return 0;
}

void CPropertiesWnd::OnSize(UINT nType, int cx, int cy)
{
	__super::OnSize(nType, cx, cy);
	AdjustLayout();
}

void CPropertiesWnd::OnExpandAllProperties()
{
	m_wndPropList.ExpandAll();
}

void CPropertiesWnd::OnUpdateExpandAllProperties(CCmdUI* /* pCmdUI */)
{
}

// afx_msg 
void CPropertiesWnd::OnAlphabetical()
{
	m_wndPropList.SetAlphabeticMode(TRUE);
}

// afx_msg 
void CPropertiesWnd::OnUpdateAlphabetical(CCmdUI* pCmdUI)
{
	pCmdUI->SetCheck(m_wndPropList.IsAlphabeticMode());
}

// afx_msg 
void CPropertiesWnd::OnCategorized()
{
	m_wndPropList.SetAlphabeticMode(FALSE);
}

// afx_msg 
void CPropertiesWnd::OnUpdateCategorized(CCmdUI* pCmdUI)
{
	pCmdUI->SetCheck(!m_wndPropList.IsAlphabeticMode());
}


void CPropertiesWnd::InitPropList()
{
	SetPropListFont();

	COLORREF colorGroup = RGB(238, 238, 242);
	COLORREF colorDescription = RGB(255, 255, 255);

	m_wndPropList.SetCustomColors(
		(COLORREF)-1, /*clrBackground*/
		(COLORREF)-1, /*clrText*/
		colorGroup, /*clrGroupBackground*/
		(COLORREF)-1, /*clrGroupText*/
		colorDescription, /*clrDescriptionBackground*/
		(COLORREF)-1, /*clrDescriptionText*/
		colorGroup /*clrLine*/);

	m_wndPropList.EnableHeaderCtrl(FALSE);
	m_wndPropList.EnableDescriptionArea();
	m_wndPropList.SetDescriptionRows(4);
	m_wndPropList.SetVSDotNetLook();
	m_wndPropList.MarkModifiedProperties();

	CMFCPropertyGridProperty* pGroup1 = new CMFCPropertyGridProperty(_T("Appearance"));

	pGroup1->AddSubItem(new CMFCPropertyGridProperty(_T("3D Look"), (_variant_t)false, _T("Specifies the window's font will be non-bold and controls will have a 3D border")));

	CMFCPropertyGridProperty* pProp = new CMFCPropertyGridProperty(_T("Border"), _T("Dialog Frame"), _T("One of: None, Thin, Resizable, or Dialog Frame"));
	pProp->AddOption(_T("None"));
	pProp->AddOption(_T("Thin"));
	pProp->AddOption(_T("Resizable"));
	pProp->AddOption(_T("Dialog Frame"));
	pProp->AllowEdit(FALSE);

	pGroup1->AddSubItem(pProp);
	pGroup1->AddSubItem(new CMFCPropertyGridProperty(_T("Caption"), (_variant_t)_T("About"), _T("Specifies the text that will be displayed in the window's title bar")));

	m_wndPropList.AddProperty(pGroup1);

	CMFCPropertyGridProperty* pSize = new CMFCPropertyGridProperty(_T("Window Size"), 0, TRUE);

	pProp = new CMFCPropertyGridProperty(_T("Height"), (_variant_t)250l, _T("Specifies the window's height"));
	pProp->EnableSpinControl(TRUE, 50, 300);
	pSize->AddSubItem(pProp);

	pProp = new CMFCPropertyGridProperty(_T("Width"), (_variant_t)150l, _T("Specifies the window's width"));
	pProp->EnableSpinControl(TRUE, 50, 200);
	pSize->AddSubItem(pProp);

	m_wndPropList.AddProperty(pSize);

	CMFCPropertyGridProperty* pGroup2 = new CMFCPropertyGridProperty(_T("Font"));

	LOGFONT lf;
	CFont* font = CFont::FromHandle((HFONT)GetStockObject(DEFAULT_GUI_FONT));
	font->GetLogFont(&lf);

	_tcscpy_s(lf.lfFaceName, _T("Arial"));

	pGroup2->AddSubItem(new CMFCPropertyGridFontProperty(_T("Font"), lf, CF_EFFECTS | CF_SCREENFONTS, _T("Specifies the default font for the window")));
	pGroup2->AddSubItem(new CMFCPropertyGridProperty(_T("Use System Font"), (_variant_t)true, _T("Specifies that the window uses MS Shell Dlg font")));

	m_wndPropList.AddProperty(pGroup2);

	CMFCPropertyGridProperty* pGroup3 = new CMFCPropertyGridProperty(_T("Misc"));
	pProp = new CMFCPropertyGridProperty(_T("(Name)"), _T("Application"));
	pProp->Enable(FALSE);
	pGroup3->AddSubItem(pProp);

	CMFCPropertyGridColorProperty* pColorProp = new CMFCPropertyGridColorProperty(_T("Window Color"), RGB(210, 192, 254), NULL, _T("Specifies the default window color"));
	pColorProp->EnableOtherButton(_T("Other..."));
	pColorProp->EnableAutomaticButton(_T("Default"), AUTO_COLOR);
	pGroup3->AddSubItem(pColorProp);

	static const TCHAR szFilter[] = _T("Icon Files(*.ico)|*.ico|All Files(*.*)|*.*||");
	pGroup3->AddSubItem(new CMFCPropertyGridFileProperty(_T("Icon"), TRUE, _T(""), _T("ico"), 0, szFilter, _T("Specifies the window icon")));

	pGroup3->AddSubItem(new CMFCPropertyGridFileProperty(_T("Folder"), _T("c:\\")));

	m_wndPropList.AddProperty(pGroup3);

	CMFCPropertyGridProperty* pGroup4 = new CMFCPropertyGridProperty(_T("Hierarchy"));

	CMFCPropertyGridProperty* pGroup41 = new CMFCPropertyGridProperty(_T("First sub-level"));
	pGroup4->AddSubItem(pGroup41);

	CMFCPropertyGridProperty* pGroup411 = new CMFCPropertyGridProperty(_T("Second sub-level"));
	pGroup41->AddSubItem(pGroup411);

	pGroup411->AddSubItem(new CMFCPropertyGridProperty(_T("Item 1"), (_variant_t)_T("Value 1"), _T("This is a description")));
	pGroup411->AddSubItem(new CMFCPropertyGridProperty(_T("Item 2"), (_variant_t)_T("Value 2"), _T("This is a description")));
	pGroup411->AddSubItem(new CMFCPropertyGridProperty(_T("Item 3"), (_variant_t)_T("Value 3"), _T("This is a description")));

	pGroup4->Expand(FALSE);
	m_wndPropList.AddProperty(pGroup4);
}

void CPropertiesWnd::OnSetFocus(CWnd* pOldWnd)
{
	__super::OnSetFocus(pOldWnd);
	m_wndPropList.SetFocus();
}

//afx_msg 
LRESULT CPropertiesWnd::OnWmiSettingChange(WPARAM wParam, LPARAM lParam)
{
	SetPropListFont();
	return 0L;
}

void CPropertiesWnd::SetPropListFont()
{
	CFont* pFont = CTheme::GetUIFont(CTheme::FontNonClient);
	m_wndPropList.SetFont(pFont);
	m_wndObjectCombo.SetFont(pFont);
}

// virtual 
void CPropertiesWnd::OnUpdateCmdUI(CFrameWnd* pTarget, BOOL bDisableIfNoHndler)
{
	__super::OnUpdateCmdUI(pTarget, bDisableIfNoHndler);
	if (!IsWindowVisible() /*|| m_bDropped*/)
		return;
	HWND hWndFocus = ::GetFocus();
	if (!hWndFocus || !IsWindow(hWndFocus))
		return;
	HWND hWndActivePopup = NULL;
	if (CMFCPopupMenu::GetActiveMenu())
		hWndActivePopup = CMFCPopupMenu::GetActiveMenu()->GetSafeHwnd();
	if (::IsChild(GetSafeHwnd(), hWndFocus) ||
		::IsChild(m_wndPropList.GetSafeHwnd(), hWndFocus) ||
		(hWndFocus == hWndActivePopup) ||
		::IsChild(hWndActivePopup, hWndFocus))
		return;

	FILL_PROPS_INFO info;
	LPARAM lParam = reinterpret_cast<LPARAM>(&info);

	LRESULT lResult = ::SendMessage(hWndFocus, WMI_FILL_PROPS, WMI_FILL_PROPS_WPARAM, lParam);
	switch (lResult) {
		case WMI_FILL_PROPS_RESULT_SKIP:
			m_wndPropList.FillPropertyValues();
			break;
		case WMI_FILL_PROPS_RESULT_UNK: // zero
		case WMI_FILL_PROPS_RESULT_EMPTY:
			m_wndPropList.Clear();
			break;
		case WMI_FILL_PROPS_RESULT_OK:
			{
				CJsElement* refValue = reinterpret_cast<CJsElement*>(info.elem);
				CJsElement* refParent = reinterpret_cast<CJsElement*>(info.parent);
				m_wndPropList.FillProperties(refValue, refParent);
			}
			break;
		case WMI_FILL_PROPS_RESULT_REFILL :
			m_wndPropList.FillPropertyValues();
			break;
	}
	/*
	JavaScriptValue value;
	JavaScriptValue parent;
	if (lResult == WMI_FILL_PROPS_RESULT_OK) {
		JsValueRef refValue = reinterpret_cast<JsValueRef>(info.elem);
		JsValueRef refParent = reinterpret_cast<JsValueRef>(info.parent);
		value = JavaScriptValue(refValue);
		parent = JavaScriptValue(refParent);
	}
	*/
}

CA2PropertyGridCtrl::CA2PropertyGridCtrl()
	:m_pJsValue(nullptr), m_pJsValueParent(nullptr)
{

}


void CA2PropertyGridCtrl::FillPropertyValues()
{
	if (m_pJsValue == nullptr)
		return;
	JavaScriptValue jsValue = GetValue();
	if (!jsValue.IsValid())
		return;
	JavaScriptValue jsValueParent = GetParentValue();
	bool bRedraw = false;
	for (int i = 0; i < GetPropertyCount(); i++) {
		auto pCat = GetProperty(i);
		for (int j = 0; j < pCat->GetSubItemsCount(); j++) {
			auto pProp = pCat->GetSubItem(j);
			CString propName = pProp->GetName();
			COleVariant newValue;
			const COleVariant oldValue = pProp->GetValue();
			JavaScriptValue propVal;
			VARTYPE vt = (VARTYPE)pProp->GetData();
			if (vt > VT_TAG)
			{
				// attached property
				vt -= VT_TAG;
				JavaScriptValue propAccessor = jsValueParent.GetProperty(L"$$" + propName);
				propVal = propAccessor.CallFunction(jsValueParent, JavaScriptValue::FromString(jsValue.GetHashKey()));
			}
			else
			{
				propVal = jsValue.GetProperty(propName);
			}
			switch (vt) {
			case VT_R8:
			{
				double propValue = propVal.ToDouble();
				newValue = COleVariant(propValue);
				if (V_R8(&newValue) != V_R8(&oldValue)) {
					pProp->SetValue(newValue);
					bRedraw = true;
				}
			}
			break;
			case VT_BSTR:
			{
				CString propValue = propVal.ToString();
				newValue = COleVariant(propValue);
				if (wcscmp(V_BSTR(&oldValue), V_BSTR(&newValue)) != 0)
				{
					pProp->SetValue(newValue);
					bRedraw = true;
				}
			}
			break;
			case VT_BOOL:
			{
				bool propValue = propVal.ToBool();
				newValue = COleVariant(propValue ? VARIANT_TRUE : VARIANT_FALSE, VT_BOOL);
				if (V_BOOL(&newValue) != V_BOOL(&oldValue))
				{
					pProp->SetValue(newValue);
					bRedraw = true;
				}
			}
			break;
			case VT_COLOR:
			{
				CMFCPropertyGridColorProperty* pColorProp = DYNAMIC_DOWNCAST(CMFCPropertyGridColorProperty, pProp);
				COLORREF oldClr = pColorProp->GetColor();
				COLORREF newClr = CConvert::String2Color(propVal.ToString());
				if (oldClr != newClr)
				{
					pColorProp->SetColor(newClr);
					bRedraw = true;
				}
			}
			break;
			default:
				ATLASSERT(FALSE);
				break;
			}
		}
	}
	if (bRedraw)
		Invalidate();
}

void CA2PropertyGridCtrl::Clear()
{
	m_pJsValue = nullptr;
	m_pJsValueParent = nullptr;
	RemoveAll();
	AdjustLayout();
	Invalidate();
}

void CA2PropertyGridCtrl::FillProperties(CJsElement* val, CJsElement* parent)
{
	if (val == m_pJsValue)
		return;
	m_pJsValue = val;
	m_pJsValueParent = parent;
	RemoveAll();
	try 
	{
		if (m_pJsValue != nullptr)
			FillPropertiesInternal();
	}
	catch (JavaScriptException& ex) 
	{
		ex.ReportError();
		m_pJsValue = nullptr;
		m_pJsValueParent = nullptr;
	}
	AdjustLayout();
	Invalidate();
}

CMFCPropertyGridProperty* CA2PropertyGridCtrl::GetPropertyValue(LPCWSTR szName, JavaScriptValue& meta, bool bAttached)
{
	CString descr = meta.GetProperty(L"description").ToStringCheck();
	CString type = meta.GetProperty(L"type").ToStringCheck();
	if (m_pJsValue == nullptr)
		return nullptr;
	JavaScriptValue jsValue = m_pJsValue->GetJsHandle();
	JavaScriptValue jsValueParent = GetParentValue();
	int vtTag = 0;
	JavaScriptValue val;
	if (bAttached) 
	{
		CString name(szName);
		JavaScriptValue propAccessor = jsValueParent.GetProperty(L"$$" + name);
		val = propAccessor.CallFunction(jsValueParent, JavaScriptValue::FromString(jsValue.GetHashKey()));
		vtTag = VT_TAG;
	}
	else
		val = jsValue.GetProperty(szName);
	CMFCPropertyGridProperty* pProp = nullptr;
	if (type == L"color") {
		ATLASSERT(FALSE);
		/*
		COLORREF clr = CConvert::String2Color(val.ToString());
		CMFCPropertyGridColorProperty* pColorProp =
			new CMFCPropertyGridColorProperty(pascalCaseName, clr, nullptr, descr, VT_COLOR + vtTag);
		pColorProp->EnableOtherButton(_T("Other..."));
		pColorProp->EnableAutomaticButton(_T("Default"), AUTO_COLOR);
		pProp = pColorProp;
		*/
	}
	else if (type == L"string")
	{
		COleVariant var = val.ToStringCheck();
		pProp = new CMFCPropertyGridProperty(szName, var, descr, VT_BSTR + vtTag);
	}
	else if (type == L"number") {
		COleVariant var = val.ToDouble();
		pProp = new CA2PropertyGridProperty(szName, var, descr, VT_R8 + vtTag);
	}
	else if (type == L"boolean") {
		COleVariant var(val.ToBool() ? VARIANT_TRUE : VARIANT_FALSE, VT_BOOL);
		pProp = new CMFCPropertyGridProperty(szName, var, descr, VT_BOOL + vtTag);
	}
	else if (type == L"version") {
		// TODO: version property type
		COleVariant var(val.ToStringCheck());
		pProp = new CMFCPropertyGridProperty(szName, var, descr, VT_BSTR + vtTag);
	}
	else if (type == L"enum") {
		COleVariant var = val.ToStringCheck();
		pProp = new CMFCPropertyGridProperty(szName, var, descr, VT_BSTR + vtTag);
		JavaScriptValue val = meta.GetProperty(L"enum");
		if (val.ValueType() == JsValueType::JsArray) {
			int len = val.GetProperty(L"length").ToInt();
			for (int i = 0; i < len; i++) {
				pProp->AddOption(val.GetProperty(i).ToString());
			}
		}
		pProp->AllowEdit(FALSE);
	}
	else
	{
		pProp = new CA2PropertyGridProperty(szName, COleVariant(EMPTYSTR), descr, VT_EMPTY + vtTag);
	}
	return pProp;
}

void CA2PropertyGridCtrl::FillPropertiesInternal()
{
	if (m_pJsValue == nullptr)
		return;
	JavaScriptValue jsValue = m_pJsValue->GetJsHandle();
	JavaScriptValue jsValueParent = GetParentValue();
	if (!jsValue.IsValid())
		return;
	JavaScriptPropertyId catPropId = JavaScriptPropertyId::FromString(L"category");
	JavaScriptPropertyId metaPropId = JavaScriptPropertyId::FromString(L"_meta_");

	auto meta = jsValue.GetProperty(metaPropId);
	if (meta.ValueType() != JsValueType::JsObject)
		return;
	auto props = meta.GetProperty(L"properties");
	if (props.ValueType() != JsValueType::JsObject)
		return;

	JavaScriptValue attached = JavaScriptValue::Invalid();
	if (jsValueParent.IsValid())
		attached = jsValueParent.GetProperty(metaPropId).GetProperty(L"attached");

	CArray<CString, LPCWSTR> names;
	CMap<CString, LPCWSTR, CA2PropertyGridProperty*, CA2PropertyGridProperty*> catMap;


	props.PropertyNames(names);

	for (int i = 0; i < names.GetSize(); i++) {
		CString& name = names.ElementAt(i);
		if (name.IsEmpty())
			continue;
		JavaScriptValue info = props.GetProperty(name);
		CString category = info.GetProperty(catPropId).ToStringCheck();
		if (category.IsEmpty())
			category = DEFAULT_CATEGORY;
		CA2PropertyGridProperty* pProp = NULL;
		if (!catMap.Lookup(category, pProp)) {
			pProp = new CA2PropertyGridProperty(category);
			AddProperty(pProp, FALSE, FALSE);
			catMap.SetAt(category, pProp);
		}
		pProp->AddSubItem(GetPropertyValue(name, info, false));
	}

	// and attached now
	if (attached.IsValid() && (attached.ValueType() == JsValueType::JsObject)) 
	{
		names.RemoveAll();
		attached.PropertyNames(names);
		for (int i = 0; i < names.GetSize(); i++) 
		{
			CString name = names.ElementAt(i);
			if (name.IsEmpty())
				continue;
			JavaScriptValue info = attached.GetProperty(name);
			CString category = info.GetProperty(catPropId).ToStringCheck();
			if (category.IsEmpty())
				category = DEFAULT_CATEGORY;
			CA2PropertyGridProperty* pProp = NULL;
			if (!catMap.Lookup(category, pProp)) 
			{
				pProp = new CA2PropertyGridProperty(category);
				AddProperty(pProp, FALSE, FALSE);
				catMap.SetAt(category, pProp);
			}
			pProp->AddSubItem(GetPropertyValue(name, info, true));
		}
	}
}