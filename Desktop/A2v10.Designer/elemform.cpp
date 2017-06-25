
#include "stdafx.h"
#include "formitem.h"
#include "elemform.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

CFormElement::CFormElement()
{
	m_position.SetRect(0, 0, 400 * 75, 300 * 75);
}

// virtual 
void CFormElement::Draw(const RENDER_INFO& ri)
{
	CBrushSDC brush(ri.pDC, RGB(240, 240, 240));
	ri.pDC->Rectangle(m_position);
}
