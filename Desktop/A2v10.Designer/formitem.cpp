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

