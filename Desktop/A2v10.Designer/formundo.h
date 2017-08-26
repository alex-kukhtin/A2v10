#pragma once


class CA2FormDocument;
class CFormItem;

class CFormUndo
{
public:
	enum Action {
		_create,
		_delete,
		_change
	};

public:
	CFormUndo();
	virtual ~CFormUndo();

	bool CanUndo() const;
	bool CanRedo() const;

	void DoUndo(CA2FormDocument* pDoc);
	void DoRedo(CA2FormDocument* pDoc);

	void DoAction(Action act, CFormItem* pItem);

	void RemoveHead();

	void ClearUndo();
	void ClearRedo();
	void Clear()
	{
		ClearUndo();
		ClearRedo();
	}

protected:

	class CUndoElem {
	public:
		CUndoElem()
			: m_pClone(NULL) {};
		CFormItem* m_pClone;
	};

	class CUndoItem {
	public:
		CUndoItem() : m_prevGuid(GUID_NULL) {};

		Action m_action;

		CList<CUndoElem*, CUndoElem*> m_list;
		GUID m_prevGuid;

		virtual ~CUndoItem();
		void Clear();

		void RemoveItems(CA2FormDocument* pDoc);
		void Reincarnate(CA2FormDocument* pDoc);
		void Unchange(CA2FormDocument* pDoc);
	};

	CList<CUndoItem*, CUndoItem*> m_undoStack;
	CList<CUndoItem*, CUndoItem*> m_redoStack;

	void CheckSize();
};


