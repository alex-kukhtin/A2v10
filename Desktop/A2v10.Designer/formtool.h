#pragma once

class CA2FormView;

class CFormTool : public CObject
{
public:

	enum Shape {
		_undefined = -1,
		_pointer = 0,
		_button = 1,
		_checkbox = 2,
		_radio = 3,
		_combobox = 4,
		_datagrid = 5,
		_canvas = 100,
		_grid = 101,
		_dockpanel = 102,
		_stackPanel = 103,
	};

	CFormTool(Shape shape, UINT nID);
	virtual ~CFormTool() {};

	Shape m_eShape;
	UINT m_nID;

	// Overridables
	virtual void OnLButtonDown(CA2FormView* pView, UINT nFlags, const CPoint& point);
	virtual void OnLButtonDblClk(CA2FormView* pView, UINT nFlags, const CPoint& point);
	virtual void OnCancel();

	static CFormTool* FindTool();
	static CList<CFormTool*> s_toolsList;
	static Shape s_currentShape;
	static UINT s_currentId;

	static void SetShape(UINT nID);
	static bool IsShape(UINT nID);
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

