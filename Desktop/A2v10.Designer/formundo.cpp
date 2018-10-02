
#include "stdafx.h"

#include "formundo.h"
#include "a2formdoc.h"
#include "formitem.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif

static const int UNDO_STACK_SIZE = 10;

// virtual 
CFormUndo::CUndoItem::~CUndoItem()
{
	Clear();
}

void CFormUndo::CUndoItem::Clear()
{
	POSITION pos = m_list.GetHeadPosition();
	while (pos) {
		CUndoElem* pElem = m_list.GetNext(pos);
		if (pElem) {
			if (pElem->m_pClone) {
				delete pElem->m_pClone;
				pElem->m_pClone = nullptr;
			}
			// оригинал не трогаем
			delete pElem;
		}
	}
	m_list.RemoveAll();
}

void CFormUndo::CUndoItem::RemoveItems(CA2FormDocument* pDoc)
{
	/*
	// Удалим из документа все оригиналы
	POSITION pos = m_list.GetHeadPosition();
	while (pos) {
		CUndoElem* pElem = m_list.GetNext(pos);
		CFormItem* pItem = pDoc->Find(pElem->m_pClone->m_Guid);
		if (pItem != NULL) {
			pDoc->GetFirstView()->Deselect(pItem);
			pDoc->Remove(pItem);
			pItem->Remove();
		}
	}
	pDoc->GetActivePage()->UpdateTabIndexes();
	pDoc->UpdateAllViews(NULL);
	*/
}

void CFormUndo::CUndoItem::Reincarnate(CA2FormDocument* pDoc)
{
	/*
	// Сначала удалим текущий Selection
	pDoc->UpdateAllViews(NULL, HINT_VF_RESET_SELECTION, NULL);
	// Воссоздадим элементы 
	// Оригиналы уже не существуют
	// Вернем клоны и уберем их из списка
	POSITION pos = m_list.GetHeadPosition();
	while (pos) {
		CUndoElem* pElem = m_list.GetNext(pos);
		CFormItem* pItem = pElem->m_pClone->Clone();
		pItem->ReClone();
		pDoc->Add(pItem);
		pDoc->UpdateAllViews(NULL, HINT_VF_ITEMSELECT_ADD, pItem);
	}
	pDoc->GetActivePage()->UpdateTabIndexes();
	pDoc->UpdateAllViews(NULL);
	*/
}


void CFormUndo::CUndoItem::Unchange(CA2FormDocument* pDoc)
{
	POSITION pos = m_list.GetHeadPosition();
	while (pos) {
		CUndoElem* pElem = m_list.GetNext(pos);
		CFormItem* pOriginal = pDoc->UndoChanges(pElem->m_pClone);
		if (pOriginal) {
			*pElem->m_pClone = *pOriginal;
			delete pOriginal;
		}
	}
	// update all elements
	pDoc->UpdateAllViews(NULL);
}


CFormUndo::CFormUndo()
{
}

//virtual 
CFormUndo::~CFormUndo()
{
	ClearUndo();
	ClearRedo();
}

void CFormUndo::ClearRedo()
{
	POSITION pos = m_redoStack.GetHeadPosition();
	while (pos) {
		CUndoItem* pItem = m_redoStack.GetNext(pos);
		delete pItem;
	}
	m_redoStack.RemoveAll();
}

void CFormUndo::ClearUndo()
{
	POSITION pos = m_undoStack.GetHeadPosition();
	while (pos) {
		CUndoItem* pItem = m_undoStack.GetNext(pos);
		delete pItem;
	}
	m_undoStack.RemoveAll();
}

bool CFormUndo::CanUndo() const
{
	return m_undoStack.IsEmpty() ? false : true;
}

bool CFormUndo::CanRedo() const
{
	return m_redoStack.IsEmpty() ? false : true;
}

void CFormUndo::CheckSize()
{
	if (m_undoStack.GetCount() >= UNDO_STACK_SIZE) {
		while (m_undoStack.GetCount() > UNDO_STACK_SIZE) {
			CUndoItem* pUndo = m_undoStack.RemoveTail();
			delete pUndo;
		}
	}
	if (m_redoStack.GetCount() >= UNDO_STACK_SIZE) {
		while (m_redoStack.GetCount() > UNDO_STACK_SIZE) {
			CUndoItem* pRedo = m_redoStack.RemoveTail();
			delete pRedo;
		}
	}
}

void CFormUndo::RemoveHead()
{
	// Удалим верхний элемент из стека
	if (m_undoStack.IsEmpty())
		return;
	CUndoItem* pItem = m_undoStack.RemoveHead();
	delete pItem;
}

void CFormUndo::DoUndo(CA2FormDocument* pDoc)
{
	if (m_undoStack.IsEmpty())
		return;
	CUndoItem* pUndo = m_undoStack.RemoveHead();
	switch (pUndo->m_action) {
	case _create:
		// create -> remove
		pUndo->RemoveItems(pDoc);
		break;
	case _delete:
		// delete -> reincarnate
		pUndo->Reincarnate(pDoc);
		break;
	case _change:
		// change -> unchange
		pUndo->Unchange(pDoc);
		break;
	default:
		ASSERT(FALSE);
		break;
	}
	m_redoStack.AddHead(pUndo);
	CheckSize();
};


void CFormUndo::DoRedo(CA2FormDocument* pDoc)
{
	if (m_redoStack.IsEmpty())
		return;
	CUndoItem* pRedo = m_redoStack.RemoveHead();
	switch (pRedo->m_action) {
	case _create:
		// create -> reincarnate
		pRedo->Reincarnate(pDoc);
		break;
	case _delete:
		// delete -> delete
		pRedo->RemoveItems(pDoc);
		break;
	case _change:
		// change -> unchange
		pRedo->Unchange(pDoc);
		break;
	default:
		ASSERT(FALSE);
	}
	m_undoStack.AddHead(pRedo);
}


void CFormUndo::DoAction(Action act, CFormItem* pItem)
{
	CUndoItem* pUndo = new CUndoItem();
	pUndo->m_action = act;
	CUndoElem* pElem = new CUndoElem();
	pElem->m_pClone = pItem->Clone();
	pUndo->m_list.AddHead(pElem);
	m_undoStack.AddHead(pUndo);
	CheckSize();
	ClearRedo();
}
