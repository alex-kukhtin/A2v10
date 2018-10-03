// Copyright © 2012-2018 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "formitem.h"
#include "grid.h"
#include "a2formdoc.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

//TODO: FIT ROW AND COLUMNS WIDTH

#define ROWS 3
#define COLS 3

IMPLEMENT_DYNCREATE(CGridElement, CFormItem)

CItemRegister grid(L"Grid", RUNTIME_CLASS(CGridElement), CFormItem::_grid);

// virtual 
void CGridElement::Draw(const RENDER_INFO& ri)
{
	CBrushSDC brush(ri.pDC, RGB(255, 248, 255));
	//CRect rc(m_pParent->GetPosition());
	//rc.DeflateRect(1200, 1200);
	CRect rc = m_position;
	ri.pDC->Rectangle(rc);
	int gw = rc.Width() / COLS;
	int gh = rc.Height() / COLS;
	int cx = rc.left;
	int cy = rc.top;
	for (int i = 0; i < ROWS; i++) {
		cx += gw;
		ri.pDC->MoveTo(cx, rc.top);
		ri.pDC->LineTo(cx, rc.bottom);
	}
	for (int j = 0; j < COLS; j++) {
		cy += gh;
		ri.pDC->MoveTo(rc.left, cy);
		ri.pDC->LineTo(rc.right, cy);
	}
	//ri.pDC->DrawText(L"Grid", -1, rc, DT_CENTER | DT_SINGLELINE | DT_VCENTER);
	DrawChildren(ri);
}

// virtual 
void CGridElement::AddAttachedProperty(const wchar_t* name, int value, CFormItem* pItem)
{
	if (wcsncmp(name, L"Row", 10) == 0)
		m_attachedRow.SetAt(pItem, value);
	else if (wcsncmp(name, L"Col", 10) == 0)
		m_attachedCol.SetAt(pItem, value);
}

// virtual 
void CGridElement::Measure(const CSize& available)
{
	CSize szParent = m_pParent->GetPosition().Size();
	m_desiredSize.SetSize(szParent.cx, 3600 * ROWS);
}

// virtual 
void CGridElement::Arrange(const CRect& position)
{
	m_position = CRect(position.TopLeft(), m_desiredSize);
	POSITION pos = m_children.GetHeadPosition();
	CSize szPos = m_position.Size();
	int rowSize = szPos.cy / COLS;
	int colSize = szPos.cx / ROWS;
	int row;
	int col;
	while (pos) {
		CFormItem* pItem = m_children.GetNext(pos);
		// TODO:
		if (m_attachedRow.Lookup(pItem, row) && m_attachedCol.Lookup(pItem, col)) {
			row -= 1;
			col -= 1;
			CRect itemRect(m_position.left + col * colSize, m_position.top + row * rowSize, 0, 0);
			itemRect.bottom = itemRect.top + rowSize;
			itemRect.right = itemRect.left + colSize;
			pItem->SetPosition(itemRect);
		}
	}
}

int getColNo(int x, int colsize) 
{
	int x1 = 0;
	int x2 = colsize;
	int delta = 100;
	for (int c = 0; c < COLS; c++) {
		if (x >= x1 - delta && x <= x2 + delta)
			return c;
		x1 += colsize;
		x2 += colsize;
	}
	return 0;
}

// virtual 
CRect CGridElement::AdjustTrackRect(CFormItem* pItem, const CRect& rect, const CPoint& offset)
{
	CPoint pt(rect.left, rect.top);
	CSize szPos = m_position.Size();
	pt.x += offset.x - pItem->GetPosition().left;
	pt.y += offset.y - pItem->GetPosition().top;
	int rowSize = szPos.cy / ROWS;
	int colSize = szPos.cx / COLS;
	int row = (pt.y - m_position.top) / rowSize;
	//int col = (pt.x - m_position.left) / colSize;
	int col = getColNo(pt.x - m_position.left, colSize);
	if (col > COLS - 1)
		col = COLS - 1;
	if (col < 0)
		col = 0;
	if (row > ROWS - 1)
		row = ROWS - 1;
	if (row < 0)
		row = 0;
	CRect newRect(m_position.left + col * colSize, m_position.top + row * rowSize, 0, 0);
	newRect.bottom = newRect.top + rowSize;
	newRect.right = newRect.left + colSize;
	return newRect;
}

// virtual 
void CGridElement::OnSetPositionChild(CFormItem* pItem)
{
	CRect itemPos = pItem->GetPosition();
	CSize szPos = m_position.Size();
	int rowSize = szPos.cy / ROWS;
	int colSize = szPos.cx / COLS;
	int row = (itemPos.top - m_position.top) / rowSize;
	int col = (itemPos.left - m_position.left) / colSize;
	m_attachedRow.SetAt(pItem, row + 1);
	m_attachedCol.SetAt(pItem, col + 1);
}

// virtual 
void CGridElement::SetAttachedPropertyToXml(CFormItem* pItem)
{
	int row;
	int col;
	if (m_attachedRow.Lookup(pItem, row))
		pItem->GetXmlNode()->SetAttribute(L"Grid.Row", row);
	if (m_attachedCol.Lookup(pItem, col))
		pItem->GetXmlNode()->SetAttribute(L"Grid.Col", col);
}
