#include "stdafx.h"
#include "formitem.h"
#include "recttracker.h"
#include "a2formdoc.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

CFormItem::CFormItem()
: m_position(0, 0, 0, 0),
  m_jsValue(JS_INVALID_REFERENCE)
{
}

// virtual 
CFormItem::~CFormItem()
{

}

// virtual 
CSize CFormItem::GetMinTrackSize() const
{
	return CSize(1, 1);
}

// virtual 
CFormItem* CFormItem::ObjectAt(CPoint point)
{
	auto found = std::find_if(m_children.begin(), m_children.end(), [point](CFormItem* pItem) 
	{
		return pItem->ObjectAt(point) != nullptr;
	});
	if (found != m_children.end())
		return *found;
	if (m_position.PtInRect(point))
		return this;
	return nullptr;
}

// position is in logical
void CFormItem::MoveTo(const CRect& position, CA2FormView* pView, int hitHandle)
{
	CRect np(position);
	//if (hitHandle != -1 && GetDocument()->IsSnapToGrid())
	//SnapRect(np, hitHandle, m_position);
	np.NormalizeRect();
	if (np == m_position)
		return;
	/*
	Invalidate(); // old position
	SetPosition(np);
	Invalidate(); // new position
	pView->GetDocument()->SetModifiedFlag();
	*/
}

// virtual 
void CFormItem::SaveToXaml(tinyxml2::XMLDocument* xmldoc, tinyxml2::XMLElement* parent)
{
	auto item = xmldoc->NewElement(ElementName());
	if (parent == nullptr)
		xmldoc->InsertEndChild(item);
	else
		parent->InsertEndChild(item);
	SetXamlAttributes(item);
	auto comment = xmldoc->NewComment(L"это комментарий в тексте");
	xmldoc->InsertEndChild(comment);
}
