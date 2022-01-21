
#include "stdafx.h"
#include "formitem.h"
#include "elemform.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif

CItemRegister form(L"Form", RUNTIME_CLASS(CFormElement), CFormItem::Shape::_form);

IMPLEMENT_DYNCREATE(CFormElement, CFormItem)

void CFormElement::Xml2Properties()
{
	ATLASSERT(m_pNode);
	double width = 400; // default size
	double height = 300;

	auto meta = m_jsValue.GetPropertyChain(L"_meta_.properties");

	for (auto pAttr = m_pNode->FirstAttribute(); pAttr; pAttr = pAttr->Next()) {
		CString attrName = pAttr->Name();
		//SetAttributeValue(attrName, pAttr->Value());
		if (attrName == L"Width")
			width = pAttr->DoubleValue();
		else if (attrName == L"Height")
			height = pAttr->DoubleValue();
		else if (attrName == L"Title")
			m_title = pAttr->Value();
	}
	m_jsValue.SetProperty(L"Width", width);
	m_jsValue.SetProperty(L"Height", height);
	m_jsValue.SetProperty(L"Title", m_title);
	m_position.SetRect(0, 0, (int) (width * 75.0), (int) (height * 75.0));
	for (auto pChild = m_pNode->FirstChildElement(); pChild; pChild = pChild->NextSiblingElement()) {
		CString name = pChild->Name();
		// Create child element or set object properties
	}
}

// virtual 
void CFormElement::Properties2Xml()
{
	ATLASSERT(m_pNode);
	m_pNode->SetAttribute(L"Width", m_position.Width() / 75.0);
	m_pNode->SetAttribute(L"Height", m_position.Height() / 75.0);
	if (m_title.IsEmpty())
		m_pNode->DeleteAttribute(L"Title");
	else
		m_pNode->SetAttribute(L"Title", m_title);
	m_jsValue.SetProperty(L"Width", m_position.Width() / 75.0);
	m_jsValue.SetProperty(L"Height", m_position.Height() / 75.0);
	m_jsValue.SetProperty(L"Title", (LPCWSTR) m_title);
}

// virtual 
void CFormElement::Draw(const RENDER_INFO& ri)
{
	CBrushSDC brush(ri.pDC, RGB(240, 255, 240));
	ri.pDC->Rectangle(m_position);
	ri.pDC->DrawText(m_title, m_position, DT_CENTER | DT_SINGLELINE | DT_VCENTER);
	DrawChildren(ri);
}


// virtual
void CFormElement::OnJsPropertyChange(LPCWSTR szPropName)
{
	CRect newpos = m_position;
	if (wcscmp(szPropName, L"Width") == 0) 
	{
		double w = m_jsValue.GetProperty(L"Width").ToDouble();
		newpos.right = newpos.left + (int) (w * 75.0);
	}
	else if (wcscmp(szPropName, L"Height") == 0) 
	{
		double h = m_jsValue.GetProperty(L"Height").ToDouble();
		newpos.bottom = newpos.top + (int)(h * 75.0);
	}
	MoveTo(newpos);
}

// virtual 
CFormItem& CFormElement::operator=(const CFormItem& other)
{
	CFormItem::operator=(other);
	const CFormElement& elem = (CFormElement&)other;
	m_title = elem.m_title;
	if (m_jsValue.IsValid()) {
		m_jsValue.SetProperty(L"Width", m_position.Width() / 75.0);
		m_jsValue.SetProperty(L"Heigth", m_position.Height() / 75.0);
	}
	return *this;
};

