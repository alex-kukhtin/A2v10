
#include "stdafx.h"
#include "formitem.h"
#include "textbox.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

IMPLEMENT_DYNCREATE(CTextBoxElement, CFormItem)

CItemRegister textbox(L"TextBox", RUNTIME_CLASS(CTextBoxElement), CFormItem::_textbox);

// virtual 
void CTextBoxElement::Draw(const RENDER_INFO& ri)
{
	CBrushSDC brush(ri.pDC, RGB(255, 255, 170));
	// TODO: TESTING
	//int top = __Row * 1800; 
	CRect rc(m_position);
	ri.pDC->Rectangle(rc);
	ri.pDC->DrawText(ElementName() , -1, rc, DT_CENTER | DT_SINGLELINE | DT_VCENTER);
}

// virtual 
void CTextBoxElement::Xml2Properties()
{
	for (auto pAttr = m_pNode->FirstAttribute(); pAttr; pAttr = pAttr->Next()) {
		CString attrName = pAttr->Name();
		if (attrName == L"Grid.Row") {
			// TODO: for TESTING
			__Row = pAttr->IntValue();
		}
	}
}
