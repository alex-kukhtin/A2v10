// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

#pragma once

class CFormItem;
class CA2FormDocument;
class CItemRegisterMap;
class tinyxml2::XMLElement;

// TRACK MASK
// BitNo == TrackerHit + 1
#define RTRE_TOPLEFT     0x00000001
#define RTRE_TOPRIGHT    0x00000002
#define RTRE_BOTTOMRIGHT 0x00000004
#define RTRE_BOTTOMLEFT  0x00000008
#define RTRE_TOP         0x00000010
#define RTRE_RIGHT       0x00000020
#define RTRE_BOTTOM      0x00000040
#define RTRE_LEFT        0x00000080
#define RTRE_MIDDLE      0x00000100
#define RTRE_ALL         0x000001FF
#define RTRE_SIZEONLY    (RTRE_RIGHT | RTRE_BOTTOM | RTRE_BOTTOMRIGHT)

struct RENDER_INFO
{
	CDC* pDC;
	RENDER_INFO() :pDC(NULL) {}
private:
	RENDER_INFO(const RENDER_INFO&); // declare only
	RENDER_INFO& operator=(const RENDER_INFO&); // declare only
};

class CA2FormView;

class CFormItemList : public CList<CFormItem*>
{
public:
	virtual ~CFormItemList();
	void Clear();
};

typedef CList<CFormItem*> CFormItemWeakList;

class CFormItem : public CObject
{
	DECLARE_DYNAMIC(CFormItem)
protected:
	CRect m_position;
	CSize m_desiredSize;
	JavaScriptValue m_jsValue;
	
	CFormItem* m_pParent;
	CA2FormDocument* m_pDoc;

	tinyxml2::XMLElement* m_pNode;
	CFormItemList m_children;

public:

	enum Shape {
		_undefined = -1,
		_pointer = 0,
		_button = 1,
		_checkbox = 2,
		_radio = 3,
		_combobox = 4,
		_datagrid = 5,
		_textbox = 6,
		_canvas = 100,
		_grid = 101,
		_dockpanel = 102,
		_stackPanel = 103,
		_form = 500,
	};

	CFormItem();

	GUID m_guid;

	static CItemRegisterMap& Register(LPCWSTR szClassName, CRuntimeClass* pRuntimeClass, CFormItem::Shape shape);

	static CFormItem* CreateNode(LPCWSTR szClassName);
	static CFormItem* CreateElement(CFormItem::Shape shape, CFormItem* pParent);
	static CFormItem* CreateObjectRuntime(CRuntimeClass* pRuntimeClass, CFormItem* pParent);

	virtual void ConstructObject();
	void ConstructFromXml(CA2FormDocument* pDoc, tinyxml2::XMLElement* pNode);

	JsValueRef GetJsHandle() { return (JsValueRef)m_jsValue; }
	CFormItem* GetParent() { return m_pParent; }
	tinyxml2::XMLElement* GetXmlNode() { return m_pNode; }
	CFormItem* FindByGuid(const GUID& guid);

	void OnChanged();
	bool CheckAttached(const tinyxml2::XMLAttribute* attr, CFormItem* pItem);
	bool DoAdjustTrackRect(LPRECT rect, const CPoint& offset);
	const CRect& GetPosition() const { return m_position; }
	void SetPosition(const CRect& pos) { m_position = pos; }

	virtual ~CFormItem();

	virtual LPCWSTR ElementName() abstract;
	virtual void Xml2Properties();
	virtual void Properties2Xml();
	virtual DWORD GetTrackMask() const { return RTRE_ALL; }
	virtual CFormItem* ObjectAt(CPoint point);
	virtual CSize GetMinTrackSize() const;
	virtual void MoveTo(const CRect& newPos);
	virtual void OnJsPropertyChange(LPCWSTR szPropName);

	virtual void Draw(const RENDER_INFO& ri) abstract;
	virtual void DrawChildren(const RENDER_INFO& ri);
	virtual void AddAttachedProperty(const wchar_t* name, int value, CFormItem* pItem);
	virtual void SetAttachedPropertyToXml(CFormItem* pItem);
	virtual CFormItem* Clone();
	virtual CFormItem& operator=(const CFormItem& other);

	virtual void Invalidate();
	virtual void AddChildItem(CFormItem* pItem);
	virtual void Measure(const CSize& available);
	virtual void Arrange(const CRect& position);
	virtual CRect AdjustTrackRect(CFormItem* pItem, const CRect& rect, const CPoint& offset);
	virtual void OnSetPositionChild(CFormItem* pItem);
private:

};

class CItemRegister
{
public:
	CItemRegister(LPCTSTR szClassName, CRuntimeClass* pClass, CFormItem::Shape shape);
};

class CItemRegisterMap
{
public:
	CMap<CString, LPCWSTR, CRuntimeClass*, CRuntimeClass*&> m_str2RC;
	CMap<CFormItem::Shape, CFormItem::Shape, CRuntimeClass*, CRuntimeClass*&> m_shape2RC;
};
