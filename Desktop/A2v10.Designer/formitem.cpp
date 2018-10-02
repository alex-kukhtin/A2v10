#include "stdafx.h"
#include "formitem.h"
#include "recttracker.h"
#include "a2formdoc.h"
#include "a2formview.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

// CItemRegister

CItemRegister::CItemRegister(LPCTSTR szClassName, CRuntimeClass* pClass, CFormItem::Shape shape)
{
	CFormItem::Register(szClassName, pClass, shape);
}

IMPLEMENT_DYNAMIC(CFormItem, CObject)

CFormItem::CFormItem()
: m_pDoc(nullptr), m_pNode(nullptr), m_position(0, 0, 0, 0), m_pParent(nullptr)
{
	VERIFY(SUCCEEDED(::CoCreateGuid(&m_guid)));
}

void CFormItem::ConstructFromXml(CA2FormDocument* pDoc, tinyxml2::XMLElement* pNode)
{
	m_pDoc = pDoc;
	m_pNode = pNode;
	ConstructObject();
	Xml2Properties();
	if (pNode) {
		auto pChild = pNode->FirstChildElement();
		while (pChild != nullptr) {
			CString name = pChild->Name();
			CFormItem* pNew = CFormItem::CreateNode(name);
			if (pNew) {
				pNew->m_pParent = this;
				pNew->ConstructFromXml(pDoc, pChild);
				m_children.AddTail(pNew);
			}
			pChild = pChild->NextSiblingElement();
		}
	}
}

// virtual 
CFormItem::~CFormItem()
{
	if (m_jsValue.IsValid())
		m_jsValue.Release();
}

// static 
CFormItem* CFormItem::CreateNode(LPCWSTR szClassName)
{
	if ((szClassName == nullptr) || (*szClassName == NULL_CHR) || (*szClassName == L'#'))
		return nullptr;
	CItemRegisterMap& sMap = Register(NULL, NULL, CFormItem::_undefined);
	CRuntimeClass* pRuntimeClass = NULL;
	if (!sMap.m_str2RC.Lookup(szClassName, pRuntimeClass))
		return nullptr;
	if (!pRuntimeClass)
		return nullptr;
	CObject* pObj = pRuntimeClass->CreateObject();
	if (pObj == nullptr)
		return nullptr;
	ASSERT_KINDOF(CFormItem, pObj);
	auto pNewItem = reinterpret_cast<CFormItem*>(pObj);
	return pNewItem;
}

// static
CFormItem* CFormItem::CreateElement(CFormItem::Shape shape, CFormItem* pParent)
{
	ATLASSERT(pParent);
	if (shape == CFormItem::_pointer)
		return nullptr;
	CItemRegisterMap& sMap = Register(NULL, NULL, CFormItem::_undefined);
	CRuntimeClass* pRuntimeClass = NULL;
	if (!sMap.m_shape2RC.Lookup(shape, pRuntimeClass))
		return nullptr;
	return CreateObjectRuntime(pRuntimeClass, pParent);
}

// static 
CFormItem* CFormItem::CreateObjectRuntime(CRuntimeClass* pRuntimeClass, CFormItem* pParent)
{
	if (!pRuntimeClass)
		return nullptr;
	CObject* pObj = pRuntimeClass->CreateObject();
	if (pObj == nullptr)
		return nullptr;
	ASSERT_KINDOF(CFormItem, pObj);
	auto pNewItem = reinterpret_cast<CFormItem*>(pObj);
	if (pParent)
		pParent->AddChildItem(pNewItem);
	return pNewItem;
}

// static 
CItemRegisterMap& CFormItem::Register(LPCWSTR szClassName, CRuntimeClass* pRuntimeClass, CFormItem::Shape shape)
{
	// статическая переменная должна быть локальной
	// тогда она создается при первом обращении
	static CItemRegisterMap sMap;
	if (szClassName != NULL) {
		sMap.m_str2RC.SetAt(szClassName, pRuntimeClass);
		sMap.m_shape2RC.SetAt(shape, pRuntimeClass);
	}
	return sMap;
}


// virtual 
CFormItem* CFormItem::Clone()
{
	CFormItem* pClone = CFormItem::CreateNode(ElementName());
	*pClone = *this;
	return pClone;
}

// virtual 
void CFormItem::ConstructObject()
{
	try {
		auto jsForm = JavaScriptValue::GlobalObject().GetPropertyChain(L"designer.form");
		auto jsCreate = jsForm.GetProperty(L"__createElement");
		auto elemName = ElementName();
		m_jsValue = jsCreate.CallFunction(jsForm, JavaScriptValue::FromString(elemName));
		ATLASSERT(m_jsValue.ValueType() == JsValueType::JsObject);
		m_jsValue.AddRef();
		if (m_pParent && !m_pNode) {
			m_pNode = m_pDoc->m_xmlDocument.NewElement(elemName);
			m_pParent->m_pNode->InsertEndChild(m_pNode);
		}
	}
	catch (JavaScriptException& ex) 
	{
		ex.ReportError();
		m_jsValue.SetInvalid();
	}
	/*
	auto jsItemConstructor = jsForms.GetProperty(objName);

	if (jsItemConstructor.ValueType() != JsValueType::JsFunction) {
		CString errMsg;
		errMsg.Format(L"Constructor for type \"%s\" not found", (LPCWSTR)objName);
		AfxMessageBox(errMsg);
		return;
	}

	ATLASSERT(jsItemConstructor.ValueType() == JsValueType::JsFunction);

	JavaScriptValue arg = JavaScriptValue::CreateObject();
	m_jsValue = jsItemConstructor.ConstructObject(arg);
	//Js2Properties();

	//JavaScriptValue func = JavaScriptValue::CreateFunction(JavaScriptObjectMap::NotifyJsCallback, (void*)(DWORD_PTR)this);
	//arg.SetProperty(L"notifyPropertyChange", func);
	*/
}

// virtual 
CSize CFormItem::GetMinTrackSize() const
{
	return CSize(1, 1);
}

CFormItem* CFormItem::FindByGuid(const GUID& guid)
{
	if (m_guid == guid)
		return this;
	// TODO: find recursive
	return nullptr;
}

// virtual 
void CFormItem::DrawChildren(const RENDER_INFO& ri)
{
	POSITION pos = m_children.GetHeadPosition();
	while (pos) {
		CFormItem* pItem = m_children.GetNext(pos);
		pItem->Draw(ri);
	}
}

// virtual
void CFormItem::Xml2Properties()
{

}

// virtual 
void CFormItem::Properties2Xml()
{

}

// virtual
void CFormItem::OnJsPropertyChange(LPCWSTR szPropName)
{

}

// virtual 
CFormItem& CFormItem::operator=(const CFormItem& other)
{
	m_guid = other.m_guid;
	m_position = other.m_position;
	//TODO: clone jsValue m_jsValue = other.m_jsValue;
	return *this;
}

// virtual 
CFormItem* CFormItem::ObjectAt(CPoint point)
{
	POSITION pos = m_children.GetTailPosition();
	while (pos) {
		CFormItem* pItem = m_children.GetPrev(pos)->ObjectAt(point);
		if (pItem)
			return pItem;
	}
	if (m_position.PtInRect(point))
		return this;
	return nullptr;
}

// virtual
void CFormItem::Invalidate()
{
	ATLASSERT(m_pDoc);
	m_pDoc->UpdateAllViews(NULL, HINT_INVALIDATE_ITEM, reinterpret_cast<CObject*>(this));
}

// position is in logical
void CFormItem::MoveTo(const CRect& position, CA2FormView* pView, int hitHandle)
{
	CRect np(position);
	//if (hitHandle != -1 && GetDocument()->IsSnapToGrid())
	  //SnapRect(np, hitHandle, m_position);
	np.NormalizeRect();
	if (np == m_position)
		return;
	Invalidate(); // old position
	SetPosition(np);
	Invalidate(); // new position
}


void CFormItem::MoveTo(const CRect& newPos)
{
	if (newPos == m_position)
		return;
	Invalidate(); // old position
	SetPosition(newPos);
	Invalidate(); // new position
}


void CFormItem::OnChanged() 
{
	m_pDoc->SetModifiedXml();
}

// virtual 
void CFormItem::SetPosition(const CRect& rect)
{
	if (m_position == rect)
		return;
	m_position = rect;
	Properties2Xml();
	OnChanged();
}

// virtual 
void CFormItem::AddChildItem(CFormItem* pItem)
{
	pItem->m_pDoc = m_pDoc;
	pItem->m_pParent = this;
	pItem->ConstructObject();
	m_children.AddTail(pItem);
	OnChanged();
}

//virtual 
CFormItemList::~CFormItemList()
{
	Clear();
	ATLASSERT(IsEmpty());
}

void CFormItemList::Clear()
{
	POSITION pos = GetHeadPosition();
	while (pos) {
		delete GetNext(pos);
	}
	RemoveAll();
}
