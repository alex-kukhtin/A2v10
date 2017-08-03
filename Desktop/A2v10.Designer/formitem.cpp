#include "stdafx.h"
#include "formitem.h"
#include "recttracker.h"
#include "a2formdoc.h"
#include "a2formview.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


CFormItem::CFormItem(CA2FormDocument* pDoc, tinyxml2::XMLElement* pNode)
: m_pDoc(pDoc), m_pNode(pNode), m_position(0, 0, 0, 0), m_pParent(nullptr)
{
}

// virtual 
CFormItem::~CFormItem()
{
	if (m_jsValue.IsValid())
		m_jsValue.Release();
}

// virtual 
void CFormItem::ConstructObject()
{
	try {
		auto jsForm = JavaScriptValue::GlobalObject().GetPropertyChain(L"designer.form");
		auto jsCreate = jsForm.GetProperty(L"__createElement");
		m_jsValue = jsCreate.CallFunction(jsForm, JavaScriptValue::FromString(ElementName()));
		m_jsValue.AddRef();
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

// virtual
void CFormItem::Xml2Properties()
{

}

// virtual 
void CFormItem::Properties2Xml()
{

}


// virtual 
CFormItem* CFormItem::ObjectAt(CPoint point)
{
	POSITION pos = m_children.GetHeadPosition();
	while (pos) {
		CFormItem* pItem = m_children.GetNext(pos)->ObjectAt(point);
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
	ASSERT_VALID(this);
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

// virtual 
void CFormItem::SetPosition(const CRect& rect)
{
	if (m_position == rect)
		return;
	m_position = rect;
	Properties2Xml();
	m_pDoc->SetModifiedXml();
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
