
#include "stdafx.h"
#include "formitem.h"
#include "elemform.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

CFormElement::CFormElement(CA2FormDocument* pDoc, tinyxml2::XMLElement* pNode)
	: CFormItem(pDoc, pNode)
{
	Xml2Properties();
}

void CFormElement::Xml2Properties()
{
	ATLASSERT(m_pNode);
	double width = 400; // default size
	double height = 300;
	for (auto pAttr = m_pNode->FirstAttribute(); pAttr; pAttr = pAttr->Next()) {
		CString attrName = pAttr->Name();
		if (attrName == L"Width")
			width = pAttr->DoubleValue();
		else if (attrName == L"Height")
			height = pAttr->DoubleValue();
		else if (attrName == L"Title")
			m_title = pAttr->Value();
	}
	m_position.SetRect(0, 0, (int) (width * 75.0), (int) (height * 75.0));
	for (auto pChild = m_pNode->FirstChildElement(); pChild; pChild = pChild->NextSiblingElement()) {
		CString name = pChild->Name();
		int fx = 55;
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
}

// virtual 
void CFormElement::Draw(const RENDER_INFO& ri)
{
	CBrushSDC brush(ri.pDC, RGB(240, 240, 240));
	ri.pDC->Rectangle(m_position);
}

