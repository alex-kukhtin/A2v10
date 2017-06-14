// JsDocument.cpp : implementation file
//

#include "stdafx.h"
#include "moduledoc.h"


IMPLEMENT_DYNCREATE(CModuleDoc, CDocument)

CModuleDoc::CModuleDoc()
{
}

BOOL CModuleDoc::OnNewDocument()
{
	if (!__super::OnNewDocument())
		return FALSE;
	return TRUE;
}

CModuleDoc::~CModuleDoc()
{
}


BEGIN_MESSAGE_MAP(CModuleDoc, CDocument)
END_MESSAGE_MAP()

