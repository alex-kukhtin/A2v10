
#include "stdafx.h"
#include "formitem.h"
#include "elemform.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

CFormElement::CFormElement()
{
	m_position.SetRect(0, 0, 400 * 75, 300 * 75);
	try {
		m_jsValue = JavaScriptRuntime::CreateDesignerElement(L"{'type':'form'}");
	}
	catch (JavaScriptException& ex) {
		ex.ReportError();
	}
}

// virtual 
void CFormElement::Draw(const RENDER_INFO& ri)
{
	CBrushSDC brush(ri.pDC, RGB(240, 240, 240));
	ri.pDC->Rectangle(m_position);
}

// virtual 
void CFormElement::SetXamlAttributes(tinyxml2::XMLElement* node)
{
	node->SetAttribute(L"xmlns", L"clr-namespace:A2v10.Xaml;assembly=A2v10.Xaml");
	node->SetAttribute(L"xmlns:x", L"http://schemas.microsoft.com/winfx/2006/xaml");

	node->SetAttribute(L"Width", m_position.Width() / 75.0);
	node->SetAttribute(L"Height", m_position.Height() / 75.0);
};

