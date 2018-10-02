
#include "stdafx.h"
#include "formitem.h"
#include "grid.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

IMPLEMENT_DYNCREATE(CGridElement, CFormItem)

CItemRegister grid(L"Grid", RUNTIME_CLASS(CGridElement), CFormItem::_grid);

// virtual 
void CGridElement::Draw(const RENDER_INFO& ri)
{
	CBrushSDC brush(ri.pDC, RGB(255, 248, 255));
	CRect rc(m_pParent->GetPosition());
	rc.DeflateRect(1200, 1200);
	ri.pDC->Rectangle(rc);
	int gw = rc.Width() / 3;
	int gh = rc.Height() / 3;
	int cx = rc.left;
	int cy = rc.top;
	for (int i = 0; i < 3; i++) {
		cx += gw;
		ri.pDC->MoveTo(cx, rc.top);
		ri.pDC->LineTo(cx, rc.bottom);
	}
	for (int j = 0; j < 3; j++) {
		cy += gh;
		ri.pDC->MoveTo(rc.left, cy);
		ri.pDC->LineTo(rc.right, cy);
	}
	ri.pDC->DrawText(L"Grid", -1, rc, DT_CENTER | DT_SINGLELINE | DT_VCENTER);
	DrawChildren(ri);
}
