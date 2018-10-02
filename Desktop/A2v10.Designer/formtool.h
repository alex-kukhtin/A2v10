#pragma once

class CA2FormView;

class CFormTool : public CObject
{
public:
	CFormTool(CFormItem::Shape shape, UINT nID);
	virtual ~CFormTool() {};

	CFormItem::Shape m_eShape;
	UINT m_nID;

	// Overridables
	virtual void OnLButtonDown(CA2FormView* pView, UINT nFlags, const CPoint& point);
	virtual void OnLButtonDblClk(CA2FormView* pView, UINT nFlags, const CPoint& point);
	virtual void OnCancel();

	static CFormTool* FindTool();
	static CList<CFormTool*> s_toolsList;
	static CFormItem::Shape s_currentShape;
	static UINT s_currentId;

	static void SetShape(UINT nID);
	static bool IsShape(UINT nID);
	static CFormItem* CreateItem(CFormItem::Shape shape, const CRect& rect, CFormItem* pParent);
};

class CFormSelectTool : public CFormTool
{
public:
	CFormSelectTool();
	virtual ~CFormSelectTool() {};

	virtual void OnLButtonDown(CA2FormView* pView, UINT nFlags, const CPoint& point);

protected:
	bool RubberBandSelect(CA2FormView* pView, const CPoint& point);
	bool HandleOneObject(CA2FormView* pView, const CPoint& point);
	bool MoveObjects(CA2FormView* pView, const CPoint& point);
};

