
#include "stdafx.h"

#include "formitem.h"
#include "formtool.h"
#include "a2formview.h"
#include "a2formdoc.h"
#include "recttracker.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// static 
CList<CFormTool*> CFormTool::s_toolsList;
// static 
CFormTool::Shape CFormTool::s_currentShape = CFormTool::_pointer;

UINT CFormTool::s_currentId = ID_TOOLBOX_POINTER;

CFormTool::CFormTool(Shape shape, UINT nID)
	: m_eShape(shape), m_nID(nID)
{
	s_toolsList.AddTail(this);
}

static CFormSelectTool selectTool;
static CFormTool buttonTool(CFormTool::_button, ID_TOOLBOX_BUTTON);
static CFormTool checkBoxTool(CFormTool::_checkbox, ID_TOOLBOX_CHECK);
static CFormTool comboBoxTool(CFormTool::_combobox, ID_TOOLBOX_COMBOBOX);
static CFormTool dataGridTool(CFormTool::_datagrid, ID_TOOLBOX_DATAGRID);
static CFormTool radioButtonTool(CFormTool::_radio, ID_TOOLBOX_RADIO);

static CFormTool canvasTool(CFormTool::_canvas, ID_TOOLBOX_CANVAS);
static CFormTool gridTool(CFormTool::_grid, ID_TOOLBOX_GRID);

// static 
void CFormTool::SetShape(UINT nID)
{
	POSITION pos = s_toolsList.GetHeadPosition();
	while (pos != NULL) {
		CFormTool* pTool = s_toolsList.GetNext(pos);
		if (pTool->m_nID == nID) {
			s_currentId = pTool->m_nID;
			s_currentShape = pTool->m_eShape;
			return;
		}
	}
	s_currentId = 0;
	s_currentShape = CFormTool::_undefined;
}

// static 
bool CFormTool::IsShape(UINT nID)
{
	return nID == s_currentId;
}

// static 
CFormTool* CFormTool::FindTool()
{
	POSITION pos = s_toolsList.GetHeadPosition();
	while (pos != NULL) {
		CFormTool* pTool = s_toolsList.GetNext(pos);
		if (pTool->m_eShape == s_currentShape)
			return pTool;
	}
	return NULL;
}

// virtual 
void CFormTool::OnLButtonDown(CA2FormView* pView, UINT nFlags, const CPoint& point)
{
	ASSERT_VALID(this);
	ASSERT_VALID(pView);
	CRectTrackerEx tracker;
	if (!tracker.TrackRubberBand(pView, point))
		return;
	// Mouse has moved
	CRect nr(tracker.m_rect);
	CPoint local(point);
	nr.NormalizeRect();
	pView->ClientToDoc(nr);
	pView->ClientToDoc(local);
	CA2FormDocument* pDoc = pView->GetDocument();
	//CFormItem* pParent = pDoc->ObjectAt(local);
	//TODOL if (pParent)
		//pParent = pParent->GetCreateTarget();
	// Convert to doc coords and snap to grid if needed
	//pView->PrepareNewRect(nr);
	// Create new object and select it 
	//pDoc->CreateItem(m_eShape, nr, pParent);
	if ((nFlags & MK_SHIFT) == 0)
		OnCancel();
}

// virtual 
void CFormTool::OnLButtonDblClk(CA2FormView* pView, UINT nFlags, const CPoint& point)
{

}

// virtual 
void CFormTool::OnCancel()
{
	CFormTool::SetShape(ID_TOOLBOX_POINTER);
}


CFormSelectTool::CFormSelectTool()
	: CFormTool(CFormTool::_pointer, ID_TOOLBOX_POINTER)
{
}

// virtual 
void CFormSelectTool::OnLButtonDown(CA2FormView* pView, UINT nFlags, const CPoint& point)
{
	bool bShift = (nFlags & MK_SHIFT) != 0;
	CA2FormDocument* pDoc = pView->GetDocument();
	ATLASSERT(pDoc);
	bool bLocked = pDoc->IsLocked();
	CPoint local(point);
	pView->ClientToDoc(local);
	/*
	CFormItem* pItem = pDoc->ObjectAt(local);
	int cnt = pDoc->m_selectionList.GetCount();
	if (cnt == 0) {

	}
	else if (cnt > 1) {
		if (!bLocked && MoveObjects(pView, point))
			return;

	}
	else if (cnt == 1) {
		if (!bLocked && HandleOneObject(pView, point))
			return; // уже обработали
	}
	if (pItem)
	{
		pView->SelectItem(pItem, bShift);
		if (!bShift) {
			if (HandleOneObject(pView, point))
				return;
		}
	}
	else
	{
		// пустое место, выделим корневой элемент
		pView->SelectItem(pDoc->m_pRoot);
	}
	*/
}

bool CFormSelectTool::HandleOneObject(CA2FormView* pView, const CPoint& point)
{
	/*
	CA2FormDocument* pDoc = pView->GetDocument();
	ATLASSERT(pDoc);
	//if (pView->IsInsideEditor())
	//return FALSE;

	ASSERT(pDoc->m_selectionList.GetCount() == 1);
	// один выделенный объект

	if (GetAsyncKeyState(GetSystemMetrics(SM_SWAPBUTTON) ? VK_RBUTTON : VK_LBUTTON) >= 0)
		return FALSE; // Left button already released

	CFormItem* pItem = pDoc->m_selectionList.GetHead();
	ATLASSERT(pItem);
	/*
	if (!pItem->m_bFirstClick) {
	if (pItem->OnLButtonDown(pView, 0, point))
	return TRUE;
	}
	// для линии pItem->OnLButtonDown уже все, что можно сделал
	// поэтому просто уходим
	//if (pItem->GetFlags() & VFITEM_ISLINE)
	//return FALSE;
	CRect tr(pItem->GetPosition());
	pView->DocToClient(tr);
	CRectTrackerEx tracker(tr, CRectTracker::resizeOutside);
	tracker.m_dwDrawStyle = pItem->GetTrackMask();
	int hit = tracker.HitTest(point);
	if (hit == CRectTracker::hitMiddle && (tracker.m_dwDrawStyle == RTRE_SIZEONLY))
		return FALSE;
	if (hit >= 0) {
		bool bLocked = pDoc->IsLocked();
		tracker.m_sizeMin = pItem->GetMinTrackSize();
		pView->DocToClient(tracker.m_sizeMin);
		if (!bLocked && tracker.Track(pView, point)) {
			// изменили положение объекта
			CRect nr(tracker.m_rect);
			nr.NormalizeRect();
			pView->ClientToDoc(nr);
			//pView->GetDocument()->m_undo.DoAction(CFormUndo::_change, pItem);
			pItem->MoveTo(nr, pView, hit);
			return TRUE;
		}
	}
	*/
	return false;
}

bool CFormSelectTool::MoveObjects(CA2FormView* pView, const CPoint& point)
{
	CA2FormDocument* pDoc = pView->GetDocument();
	//if (pView->IsInsideEditor())
	//return FALSE;
	/*
	// несколько выделенных объектов, работаем только с Move
	CPoint local(point);
	pView->ClientToDoc(local);
	CRect tr(pDoc->GetSelectionRect());
	local = tr.TopLeft();
	pView->DocToClient(tr);
	CRectTracker tracker(tr, CRectTracker::resizeOutside);
	if (tracker.HitTest(point) == CRectTracker::hitMiddle) {
		if (tracker.Track(pView, point)) {
			CRect nr(tracker.m_rect);
			nr.NormalizeRect();
			pView->ClientToDoc(nr);
			CPoint delta = (CPoint)(nr.TopLeft() - local);
			//pView->GetDocument()->m_undo.DoAction(CFormUndo::_change, &pView->m_selection);
			POSITION pos = pDoc->m_selectionList.GetHeadPosition();
			while (pos != NULL) {
				CFormItem* pItem = pDoc->m_selectionList.GetNext(pos);
				CRect position(pItem->GetPosition());
				position += delta;
				pItem->MoveTo(position, pView, -1);
			}
			return true;
		}
	}
	*/
	return false;
}
