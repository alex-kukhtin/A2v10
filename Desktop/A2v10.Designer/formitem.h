#pragma once

class CFormItem;
class CA2FormDocument;
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

class CItemRegister
{
public:
	CItemRegister(LPCTSTR szClassName, CRuntimeClass* pClass);
};

class CItemRegisterMap : public CMap<CString, LPCWSTR, CRuntimeClass*, CRuntimeClass*&> {};

class CFormItem : public CObject
{
	DECLARE_DYNAMIC(CFormItem)
protected:
	CRect m_position;
	JavaScriptValue m_jsValue;
	tinyxml2::XMLElement* m_pNode;
	CA2FormDocument* m_pDoc;
	CFormItemList m_children;
	CFormItem* m_pParent;
public:
	CFormItem();

	void Construct(CA2FormDocument* pDoc, tinyxml2::XMLElement* pNode);

	GUID m_guid;

	static CFormItem* CreateNode(LPCWSTR szClassName, CFormItem* pParent = nullptr);
	static CItemRegisterMap& Register(LPCWSTR szClassName, CRuntimeClass* pRuntimeClass);

	virtual void ConstructObject();

	JsValueRef GetJsHandle() { return (JsValueRef)m_jsValue; }
	CFormItem* GetParent() { return m_pParent; }
	CFormItem* FindByGuid(const GUID& guid);

	virtual ~CFormItem();

	virtual LPCWSTR ElementName() abstract;
	virtual void Xml2Properties();
	virtual void Properties2Xml();
	virtual DWORD GetTrackMask() const { return RTRE_ALL; }
	virtual const CRect& GetPosition() const {return m_position; }
	virtual CFormItem* ObjectAt(CPoint point);
	virtual CSize GetMinTrackSize() const;
	virtual void MoveTo(const CRect& position, CA2FormView* pView, int hitHandle);
	virtual void MoveTo(const CRect& newPos);
	virtual void OnJsPropertyChange(LPCWSTR szPropName);

	virtual void Draw(const RENDER_INFO& ri) abstract;
	virtual void DrawChildren(const RENDER_INFO& ri);
	virtual CFormItem* Clone();
	virtual CFormItem& operator=(const CFormItem& other);

	virtual void Invalidate();
	virtual void SetPosition(const CRect& rect);
private:

};