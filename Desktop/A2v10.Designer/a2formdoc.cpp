
#include "stdafx.h"

// SHARED_HANDLERS can be defined in an ATL project implementing preview, thumbnail
// and search filter handlers and allows sharing of document code with that project.
#ifndef SHARED_HANDLERS
#include "A2v10.Designer.h"
#endif

#include "formitem.h"
#include "a2formdoc.h"

#include "mainfrm.h"
#include "recttracker.h"

#include "elemform.h"
#include "sciview.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


IMPLEMENT_DYNCREATE(CA2FormDocument, CDocument)

CA2FormDocument::CA2FormDocument()
	: m_pRoot(nullptr)
{
}

// virtual 
CA2FormDocument::~CA2FormDocument()
{
	Clear();
	ATLASSERT(m_pRoot == nullptr);
}

void CA2FormDocument::Clear() 
{
	if (m_pRoot)
		delete m_pRoot;
	m_pRoot = nullptr;
}

BEGIN_MESSAGE_MAP(CA2FormDocument, CDocument)
END_MESSAGE_MAP()

// virtual 
BOOL CA2FormDocument::OnNewDocument()
{
	if (!__super::OnNewDocument())
		return FALSE;
	CreateRootElement();
	return TRUE;
}

void CA2FormDocument::CreateRootElement()
{
	ATLASSERT(m_pRoot == nullptr);
	m_pRoot = new CFormElement();
}

bool CA2FormDocument::IsLocked() const
{
	return false;
}

// virtual 
void CA2FormDocument::OnCloseDocument()
{
	Clear();
	__super::OnCloseDocument();
}

CXamlEditView* CA2FormDocument::GetXamlEditView()
{
	POSITION pos = GetFirstViewPosition();
	while (pos) {
		CXamlEditView* pView = DYNAMIC_DOWNCAST(CXamlEditView, GetNextView(pos));
		if (pView)
			return pView;
	}
	return nullptr;
}

void CA2FormDocument::ParseXml(LPCWSTR szXml) 
{
	CreateRootElement();
	tinyxml2::XMLDocument doc;
	auto error = doc.Parse(szXml);
	auto root = doc.RootElement();
	LPCWSTR rootName = root->Name();
	//m_pRoot->ParseXaml(root);
	int fx = 55;
	tinyxml2::XMLPrinter printer;
	doc.Print(&printer);
	//AfxMessageBox(printer.CStr());
	CXamlEditView* pView = GetXamlEditView();
	pView->SetText(printer.CStr());
}

// virtual 
BOOL CA2FormDocument::OnOpenDocument(LPCTSTR lpszPathName)
{
	USES_CONVERSION;
	CXamlEditView* pView = GetXamlEditView();
	ATLASSERT(pView);
	try 
	{
		CFile file(lpszPathName, CFile::modeRead | CFile::typeBinary | CFile::shareDenyRead);
		BYTE hdr[3] = { 0, 0, 0}; // UTF-8 signature
		file.Read(hdr, 3);
		if (hdr[0] == 0xef && hdr[1] == 0xbb && hdr[2] == 0xbf) {
			LONG length = (LONG) file.GetLength() - 3;
			char* buffer = new char[length + 1];
			file.Read(buffer, length);
			buffer[length] = 0;
			// set text to Scintilla view
			pView->SetTextA(buffer);
			ParseXml(A2W_CP(buffer, CP_UTF8));
			delete[] buffer;
		}
		file.Close();
	}
	catch (CFileException* ex) 
	{
		ex->ReportError();
		ex->Delete();
	}
	return TRUE;
}

// virtual 
BOOL CA2FormDocument::OnSaveDocument(LPCTSTR lpszPathName)
{
	CXamlEditView* pView = GetXamlEditView();
	ATLASSERT(pView);
	try
	{
		/*
		tinyxml2::XMLDocument doc;
		m_pRoot->SaveToXaml(&doc, nullptr);

		tinyxml2::XMLPrinter printer;
		doc.Print(&printer);

		// UTF-8 with signature
		USES_CONVERSION;
		const char* pAnsi = W2A_CP(printer.CStr(), CP_UTF8);
		*/
		CStringA utf8Text = pView->GetTextA();
		CFile file;
		file.Open(lpszPathName, CFile::modeWrite | CFile::modeCreate | CFile::shareDenyNone);
		BYTE hdr[3] = { 0xef, 0xbb, 0xbf }; // UTF-8 signature
		file.Write(hdr, 3);
		file.Write((LPCSTR) utf8Text, utf8Text.GetLength());
		file.Close();
		SetModifiedFlag(FALSE);
	}
	catch (CFileException* ex) 
	{
		ex->ReportError();
		ex->Delete();
		return FALSE;
	}
	return TRUE;
}

//virtual 
BOOL CA2FormDocument::CanCloseFrame(CFrameWnd* pFrame)
{
	if (!__super::CanCloseFrame(pFrame))
		return FALSE;
	return TRUE;
}

// virtual 
void CA2FormDocument::Serialize(CArchive& ar)
{
	ATLASSERT(FALSE);
}

// virtual 
void CA2FormDocument::SetModifiedFlag(BOOL bModified /*= TRUE*/)
{
	if (bModified) {
		UpdateAllViews(NULL, HINT_DOCUMENT_MODIFIED, 0L);
		CString strTitle = GetTitle();
		int len = strTitle.GetLength();
		if ((len > 0) && (strTitle[len - 1] != L'*')) {
			strTitle += L"*";
			SetTitle(strTitle);
		}
	}
	__super::SetModifiedFlag(bModified);
}

void CA2FormDocument::DrawContent(const RENDER_INFO& ri)
{
	ATLASSERT(m_pRoot != nullptr);
	ri.pDC->SetBkMode(TRANSPARENT);
	HGDIOBJ pOldFont = ri.pDC->SelectObject(CTheme::GetUIFont(CTheme::FontUiDefault));

	m_pRoot->Draw(ri);
	DrawSelection(ri);

	ri.pDC->SelectObject(pOldFont);
}

void CA2FormDocument::DrawSelection(const RENDER_INFO& ri)
{
	CFormItem* pItem = m_pRoot;
	bool bNotFirst = false;
	CRect xr(pItem->GetPosition());
	ri.pDC->LPtoDP(xr);
	CRectTrackerEx tr(xr, CRectTracker::resizeOutside);
	tr.m_dwDrawStyle = pItem->GetTrackMask();
	bool bOutline = bNotFirst; // || m_bOrderMode || m_bInsideEditor || GetDocument()->IsControlsLocked()
	tr.DrawItem(ri.pDC, bOutline);
}