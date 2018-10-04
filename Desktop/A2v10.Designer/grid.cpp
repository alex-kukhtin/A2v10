// Copyright © 2012-2018 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "formitem.h"
#include "grid.h"
#include "a2formdoc.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#define FIT_DELTA 50

IMPLEMENT_DYNCREATE(CGridElement, CFormItem)

CItemRegister grid(L"Grid", RUNTIME_CLASS(CGridElement), CFormItem::_grid);

CGridElement::CGridElement()
{
	m_rows.Add(3600);
	m_rows.Add(2000);
	m_rows.Add(4000);

	m_cols.Add(14000);
	m_cols.Add(10000);
	m_cols.Add(20000);
}

CRect CGridElement::CellRect(CPoint pos)
{
	CPoint topLeft(0, 0);
	for (int r = 0; r < pos.y && r < Rows(); r++)
		topLeft.y += RowHeight(r);
	for (int c = 0; c < pos.x && c < Cols(); c++)
		topLeft.x += ColWidth(c);
	CRect cellRect = CRect(topLeft, CSize(ColWidth(pos.x), RowHeight(pos.y)));
	cellRect.OffsetRect(m_position.TopLeft());
	return cellRect;
}

int CGridElement::RowHeight(int row)
{
	ATLASSERT(row >= 0 && row < Rows());
	return m_rows.GetAt(row);
}

int CGridElement::ColWidth(int col)
{
	ATLASSERT(col >= 0 && col < Cols());
	return m_cols.GetAt(col);
}


// virtual 
void CGridElement::Draw(const RENDER_INFO& ri)
{
	CBrushSDC brush(ri.pDC, RGB(255, 248, 255));
	CRect rc = m_position;
	ri.pDC->Rectangle(rc);
	int cx = rc.left;
	int cy = rc.top;
	for (int c = 0; c < Cols(); c++) {
		cx += ColWidth(c);
		ri.pDC->MoveTo(cx, rc.top);
		ri.pDC->LineTo(cx, rc.bottom);
	}
	for (int r = 0; r < Rows(); r++) {
		cy += RowHeight(r);
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
	int cx = 0;
	int cy = 0;
	for (int r = 0; r < m_rows.GetCount(); r++)
		cy += RowHeight(r);
	for (int c = 0; c < m_cols.GetCount(); c++)
		cx += ColWidth(c);
	m_desiredSize.SetSize(cx, cy);
}

// virtual 
void CGridElement::Arrange(const CRect& position)
{
	m_position = CRect(position.TopLeft(), m_desiredSize);
	int row;
	int col;
	POSITION pos = m_children.GetHeadPosition();
	while (pos) {
		CFormItem* pItem = m_children.GetNext(pos);
		if (m_attachedRow.Lookup(pItem, row) && m_attachedCol.Lookup(pItem, col)) {
			row -= 1;
			col -= 1;
			CRect itemRect(CellRect(row, col));
			pItem->SetPosition(itemRect);
		}
	}
}

CPoint CGridElement::CellFromPoint(CPoint pt)
{
	CPoint cell(Cols() - 1, Rows() - 1);
	CPoint pos(m_position.TopLeft());
	for (int c = 0; c < Cols(); c++) {
		int left = pos.x - FIT_DELTA;
		int right = pos.x + ColWidth(c) + FIT_DELTA;
		if (pt.x >= left && pt.x <= right) {
			cell.x = c;
			break;
		}
		pos.x += ColWidth(c);
	}
	for (int r = 0; r < Rows(); r++) {
		int top = pos.y - FIT_DELTA;
		int bottom = pos.y + RowHeight(r) + FIT_DELTA;
		if (pt.y >= top && pt.y <= bottom) {
			cell.y = r;
			break;
		}
		pos.y += RowHeight(r);
	}
	return cell;
}

// virtual 
CRect CGridElement::AdjustTrackRect(CFormItem* pItem, const CRect& rect, const CPoint& offset)
{
	CPoint pt(rect.left, rect.top);
	CRect itemRect = pItem->GetPosition();
	pt.x += offset.x - itemRect.left;
	pt.y += offset.y - itemRect.top;
	CPoint cell = CellFromPoint(pt);
	return CellRect(cell);
}

// virtual 
CRect CGridElement::FitItemRect(CFormItem* pItem, const CRect& rect)
{
	CPoint ptCenter(rect.left + rect.Width() / 2, rect.top + rect.Height() / 2);
	CPoint cell = CellFromPoint(ptCenter);
	return CellRect(cell);
}

// virtual 
void CGridElement::OnSetPositionChild(CFormItem* pItem)
{
	CRect rect = pItem->GetPosition();
	CPoint ptCenter(rect.left + rect.Width() / 2, rect.top + rect.Height() / 2);
	CPoint cell = CellFromPoint(ptCenter);
	m_attachedRow.SetAt(pItem, cell.y + 1);
	m_attachedCol.SetAt(pItem, cell.x + 1);
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
