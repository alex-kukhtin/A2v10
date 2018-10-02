
#include "stdafx.h"
#include "formitem.h"
#include "checkbox.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

IMPLEMENT_DYNCREATE(CCheckBoxElement, CFormItem)

CItemRegister checkBox(L"CheckBox", RUNTIME_CLASS(CCheckBoxElement), CFormItem::_checkbox);

// virtual 
void CCheckBoxElement::Draw(const RENDER_INFO& ri)
{
	CBrushSDC brush(ri.pDC, RGB(240, 220, 240));
	// TODO: TESTING
	//int top = 1 * 1800;
	CRect rc(m_position);
	ri.pDC->Rectangle(rc);
	ri.pDC->DrawText(ElementName(), -1, rc, DT_CENTER | DT_SINGLELINE | DT_VCENTER);
}

// virtual 
void CCheckBoxElement::Xml2Properties()
{
	for (auto pAttr = m_pNode->FirstAttribute(); pAttr; pAttr = pAttr->Next()) {
	}
}
