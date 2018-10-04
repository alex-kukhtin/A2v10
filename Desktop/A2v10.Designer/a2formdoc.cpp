// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

#include "stdafx.h"

// SHARED_HANDLERS can be defined in an ATL project implementing preview, thumbnail
// and search filter handlers and allows sharing of document code with that project.
#ifndef SHARED_HANDLERS
#include "A2v10.Designer.h"
#endif

#include "formitem.h"
#include "formtool.h"
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
	: m_pRoot(nullptr),
	  m_bXmlModified(false), m_bTextModified(false),
	  m_bPropertyChanged(false)
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
	ClearRoot();
}

void CA2FormDocument::ClearRoot()
{
	ClearSelection();
	if (m_pRoot)
		delete m_pRoot;
	m_pRoot = nullptr;
}

void CA2FormDocument::ClearSelection()
{
}

BEGIN_MESSAGE_MAP(CA2FormDocument, CDocument)
	ON_UPDATE_COMMAND_UI(ID_EDIT_UNDO, OnUpdateEditUndo)
	ON_UPDATE_COMMAND_UI(ID_EDIT_REDO, OnUpdateEditRedo)
	ON_UPDATE_COMMAND_UI(ID_FILE_SAVE, OnUpdateFileSave)
END_MESSAGE_MAP()

// virtual 
BOOL CA2FormDocument::OnNewDocument()
{
	if (!__super::OnNewDocument())
		return FALSE;
	CreateRootElement();
	SetModifiedFlag(FALSE);
	return TRUE;
}

void CA2FormDocument::Xml2Form()
{
	ClearRoot();
	tinyxml2::XMLElement* pNode = m_xmlDocument.RootElement();
	if (pNode != nullptr) {
		CString name = pNode->Name();
		m_pRoot = CFormItem::CreateNode(name);
		if (m_pRoot == nullptr) {
			CString msg;
			msg.Format(L"Can't create root element '%s'", name);
			AfxMessageBox(msg);
			return;
		}
		m_pRoot->ConstructFromXml(this, pNode);
	}
}

CFormItem* CA2FormDocument::ObjectAt(CPoint point)
{
	return m_pRoot->ObjectAt(point);
}

void CA2FormDocument::CreateRootElement()
{
	ATLASSERT(m_pRoot == nullptr);
	auto root = m_xmlDocument.NewElement(L"Form");
	root->SetAttribute(L"xmlns", L"clr-namespace:A2v10.Xaml;assembly=A2v10.Xaml");
	root->SetAttribute(L"xmlns:x", L"http://schemas.microsoft.com/winfx/2006/xaml");
	m_xmlDocument.InsertEndChild(root);
	m_pRoot = new CFormElement();
	m_pRoot->ConstructFromXml(this, root);
	SetXmlTextFromXml();
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


void CA2FormDocument::ParseXml(const char* szXml) 
{
	// A2W
	std::wstring wXml = std::wstring_convert<std::codecvt_utf8_utf16<wchar_t>, wchar_t>{}.from_bytes(szXml);
	auto error = m_xmlDocument.Parse(wXml.c_str());
	if (error != tinyxml2::XML_SUCCESS)
		throw CXmlError(error);
}

void CA2FormDocument::LoadDocument(CFile* pFile, CXamlEditView* pView)
{
	try 
	{
		BYTE hdr[3] = { 0, 0, 0}; // UTF-8 signature
		pFile->Read(hdr, 3);
		CStringA ansiText;
		LONG length = (LONG) pFile->GetLength();
		if (hdr[0] == 0xef && hdr[1] == 0xbb && hdr[2] == 0xbf) {
			length -= 3;
		}
		else 
		{
			THROW(new CArchiveException(CArchiveException::badSchema));
		}
		char* buffer = ansiText.GetBuffer(length + 1);
		pFile->Read(buffer, length);
		buffer[length] = 0;
		ParseXml(buffer);
		pView->SetTextA(buffer);
		pView->SetSavePoint();
		// set text to Scintilla view
		ansiText.ReleaseBuffer();
		Xml2Form();
		DoLayout();
	}
	catch (CXmlError& error) {
		// set invalid text to view ????
		// set for error state ????
		error.ReportError();
		THROW(new CUserException());
	}
}

void CA2FormDocument::DoLayout() 
{
	ATLASSERT(m_pRoot);
	m_pRoot->Measure(CSize(-1, -1));
	m_pRoot->Arrange(CRect(0, 0, 0, 0));
}

void CA2FormDocument::SetXmlFromXmlText()
{
	CXamlEditView* pView = GetXamlEditView();
	std::wstring xmlText = pView->GetText();
	m_xmlDocument.Parse(xmlText.c_str());
	Xml2Form();
	SetModifiedXml(false);
	SetModifiedText(false);
}

void CA2FormDocument::SetXmlTextFromXml()
{
	CXamlEditView* pView = GetXamlEditView();
	tinyxml2::XMLPrinter printer;
	m_xmlDocument.Print(&printer);
	pView->SetText(printer.CStr());
	SetModifiedText(false);
	SetModifiedXml(false);
}

void CA2FormDocument::SaveDocument(CFile* pFile, CXamlEditView* pView)
{
	if (!IsModified())
		return;
	ATLASSERT(pView);
	UpdateAllViews(nullptr, HINT_CLEAR_SELECTION);
	try
	{
		if (IsModifiedXml()) {
			SetXmlTextFromXml();
		}
		std::string utf8Text = pView->GetTextA();
		// try to parse xml text
		ParseXml(utf8Text.c_str());
		BYTE hdr[3] = { 0xef, 0xbb, 0xbf }; // UTF-8 signature
		pFile->Write(hdr, 3);
		pFile->Write((LPCSTR) utf8Text.c_str(), utf8Text.length() - 1); // null terminator
		m_undo.Clear();
		Xml2Form(); // always
		DoLayout();
		CFormTool::OnCancel();
	}
	catch (CXmlError& err) {
		err.ReportError();
		THROW(new CUserException());
	}
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
	CXamlEditView* pView = GetXamlEditView();
	ATLASSERT(pView);
	if (ar.IsLoading()) 
	{
		LoadDocument(ar.GetFile(), pView);
	}
	else if (ar.IsStoring()) 
	{
		SaveDocument(ar.GetFile(), pView);
		UpdateAllViews(NULL, HINT_DOCUMENT_SAVED, 0L);
	}
}

void CA2FormDocument::SetModifiedXml(bool bModified /*= true*/)
{
	m_bXmlModified = bModified;
	if (bModified) {
		m_bPropertyChanged = true;
		SetModifiedFlag(TRUE);
	}
}

void CA2FormDocument::SetModifiedText(bool bModified /*= true*/)
{
	m_bTextModified = bModified;
	if (bModified) {
		m_bPropertyChanged = true;
		SetModifiedFlag(TRUE);
	}
}

// virtual 
void CA2FormDocument::SetModifiedFlag(BOOL bModified /*= TRUE*/)
{
	if (bModified && IsModified())
		return;
	if (bModified) 
	{
		UpdateAllViews(NULL, HINT_DOCUMENT_MODIFIED, 0L);
	}
	else 
	{
		SetModifiedXml(false);
		SetModifiedText(false);
	}
	__super::SetModifiedFlag(bModified);
	UpdateFrameCounts(); // will cause name change in views
}

void CA2FormDocument::DrawContent(const RENDER_INFO& ri, CFormItemWeakList& selection)
{
	ATLASSERT(m_pRoot != nullptr);
	if (!m_pRoot) return;
	ri.pDC->SetBkMode(TRANSPARENT);
	HGDIOBJ pOldFont = ri.pDC->SelectObject(CTheme::GetUIFont(CTheme::FontUiDefault));

	m_pRoot->Draw(ri);
	DrawSelection(ri, selection);

	ri.pDC->SelectObject(pOldFont);
}

void CA2FormDocument::DrawSelection(const RENDER_INFO& ri, CFormItemWeakList& selection)
{
	if (selection.IsEmpty())
		return;
	auto pItem = selection.GetHead();
	bool bNotFirst = false;
	CRect xr(pItem->GetPosition());
	ri.pDC->LPtoDP(xr);
	CRectTrackerEx tr(xr, CRectTracker::resizeOutside);
	tr.m_dwDrawStyle = pItem->GetTrackMask();
	bool bOutline = bNotFirst; // || m_bOrderMode || m_bInsideEditor || GetDocument()->IsControlsLocked()
	tr.DrawItem(ri.pDC, bOutline);
}


CFormItem* CA2FormDocument::UndoChanges(CFormItem* pClone)
{
	if (m_pRoot == nullptr)
		return nullptr;
	CFormItem* pItem = m_pRoot->FindByGuid(pClone->m_guid);
	if (pItem == nullptr)
		return nullptr;
	CFormItem* pOriginal = pItem->Clone();
	*pItem = *pClone;
	m_bPropertyChanged = true; // fill props
	return pOriginal;
}


void CA2FormDocument::OnUpdateEditUndo(CCmdUI* pCmdUI) 
{
	pCmdUI->Enable(m_undo.CanUndo());
}

void CA2FormDocument::OnUpdateEditRedo(CCmdUI* pCmdUI)
{
	pCmdUI->Enable(m_undo.CanRedo());
}

void CA2FormDocument::OnUpdateFileSave(CCmdUI* pCmdUI)
{
	pCmdUI->Enable(IsModified());
}