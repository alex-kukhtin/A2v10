
#include "stdafx.h"

#include "../include/tinyxml2.h"
#include "../include/xmltools.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif


CXmlError::CXmlError(tinyxml2::XMLError err)
  : error(err) 
{
}

void CXmlError::ReportError() 
{
	const wchar_t* msg = tinyxml2::XMLDocument::ErrorIDToName(error);
	AfxMessageBox(msg);
}
