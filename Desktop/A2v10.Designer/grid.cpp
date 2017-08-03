
#include "stdafx.h"
#include "formitem.h"
#include "grid.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

CGridElement::CGridElement(CA2FormDocument* pDoc, tinyxml2::XMLElement* pNode)
	: CFormItem(pDoc, pNode)
{
	ConstructObject();
	Xml2Properties();
}


// virtual 
void CGridElement::Draw(const RENDER_INFO& ri)
{

}
