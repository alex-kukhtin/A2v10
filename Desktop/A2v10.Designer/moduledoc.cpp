// JsDocument.cpp : implementation file
//

#include "stdafx.h"
#include "moduledoc.h"
#include "sciview.h"
#include "moduleview.h"


IMPLEMENT_DYNCREATE(CModuleDoc, CDocument)

CModuleDoc::CModuleDoc()
{
	auto jsGlob = JavaScriptValue::GlobalObject();
	auto jsForm = jsGlob.GetPropertyChain(L"designer.solution");
	auto jsCreate = jsForm.GetProperty(L"__createElement");
	m_jsValue = jsCreate.CallFunction(jsForm, JavaScriptValue::FromString(L"Module"));
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

// virtual 
void CModuleDoc::SetPathName(LPCTSTR lpszPathName, BOOL bAddToMRU /*= TRUE*/)
{
	__super::SetPathName(lpszPathName, bAddToMRU);
	m_jsValue.SetProperty(L"Name", PathFindFileNameW(lpszPathName));
	m_jsValue.SetProperty(L"FullPath", lpszPathName);
}

// virtual 
void CModuleDoc::SetModifiedFlag(BOOL bModified /*= TRUE*/)
{
	if (bModified && IsModified())
		return;
	if (bModified) {
		UpdateAllViews(NULL, HINT_DOCUMENT_MODIFIED, 0L);
	}
	__super::SetModifiedFlag(bModified);
	UpdateFrameCounts(); // will cause name change in views
}

// virtual 
void CModuleDoc::Serialize(CArchive& ar)
{
	POSITION pos = GetFirstViewPosition();
	ATLASSERT(pos);
	CModuleView* pView = reinterpret_cast<CModuleView*>(GetNextView(pos));
	if (ar.IsStoring()) 
	{
		std::string text = pView->GetTextA(); // UTF-8
		ar.GetFile()->Write(text.c_str(), text.length());
		UpdateAllViews(NULL, HINT_DOCUMENT_SAVED, 0L);
	}
	else if (ar.IsLoading()) 
	{
		long len = (long) ar.GetFile()->GetLength();
		CStringA text;
		LPSTR buff = text.GetBuffer(len);
		ar.GetFile()->Read(buff, len);
		text.ReleaseBuffer();
		pView->SetTextA((LPCSTR) text);
		pView->SetSavePoint();
	}
}
