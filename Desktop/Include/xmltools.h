#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CXmlError
{
	tinyxml2::XMLError error;
public:
	CXmlError(tinyxml2::XMLError err);
	void ReportError();
};

#undef AFX_DATA
#define AFX_DATA
