
#include "stdafx.h"
#include "formitem.h"
#include "textbox.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

IMPLEMENT_DYNCREATE(CTextBoxElement, CFormItem)

CItemRegister textbox(L"TextBox", RUNTIME_CLASS(CTextBoxElement), CFormItem::Shape::_textbox);

// virtual 
void CTextBoxElement::Draw(const RENDER_INFO& ri)
{
	CBrushSDC brush(ri.pDC, RGB(255, 255, 170));
	// TODO: TESTING
	//int top = __Row * 1800; 
	CRect rc(m_position);
	ri.pDC->Rectangle(rc);
	CString strText;
	strText.Format(L"%d:%d", m_position.left, m_position.top);
	ri.pDC->DrawText(strText , -1, rc, DT_CENTER | DT_SINGLELINE | DT_VCENTER);
}

// virtual 
void CTextBoxElement::Measure(const CSize& available) 
{
	m_desiredSize.SetSize(5000, 1800);
}

