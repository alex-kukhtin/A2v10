
#include "stdafx.h"
#include "formitem.h"
#include "button.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

IMPLEMENT_DYNCREATE(CButtonElement, CFormItem)

CItemRegister button(L"Button", RUNTIME_CLASS(CButtonElement), CFormItem::_button);

// virtual 
void CButtonElement::Draw(const RENDER_INFO& ri)
{
	CBrushSDC brush(ri.pDC, RGB(220, 220, 220));
	// TODO: TESTING
	//int top = 1 * 1800;
	CRect rc(m_position);
	ri.pDC->Rectangle(rc);
	ri.pDC->DrawText(ElementName(), -1, rc, DT_CENTER | DT_SINGLELINE | DT_VCENTER);
}

// virtual 
void CButtonElement::Xml2Properties()
{
	for (auto pAttr = m_pNode->FirstAttribute(); pAttr; pAttr = pAttr->Next()) {
	}
}
