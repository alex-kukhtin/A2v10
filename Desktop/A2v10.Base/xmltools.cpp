
#include "stdafx.h"

#include "../include/appdefs.h"
#include "../include/xmltools.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

static LPCWSTR XML_PARSER_INSTANCE = L"Msxml2.DOMDocument.6.0";


typedef MSXML2::IXMLDOMProcessingInstructionPtr PXmlProcessingInstruction;
typedef MSXML2::IXMLDOMAttributePtr PXmlAttribute;

void CXmlError::ReportError()
{
	if (!m_msg.IsEmpty())
	{
		//CAppData::TraceERROR(TRACE_CAT_XML, CXmlFile::s_processFile, m_msg);
		AfxMessageBox(m_msg);
	}
	else
	{
		CString s(ErrorMessage());
		//CAppData::TraceERROR(TRACE_CAT_XML, CXmlFile::s_processFile, s);
		AfxMessageBox(s);
	}
	//CXmlFile::s_processFile.Empty();
}

// static
void CXmlTools::TestHR(HRESULT hr)
{
	if (FAILED(hr))
		throw CXmlError(hr);
}

PXmlNode CXmlFile::CreateRoot(LPCWSTR rootName)
{
	if (m_doc == NULL)
		CXmlTools::TestHR(m_doc.CreateInstance(XML_PARSER_INSTANCE));
	ATLASSERT(m_doc != NULL);

	PXmlElement root = m_doc->createElement(rootName);

	if (m_type == L"xaml")
	{

		root->setAttribute(L"xmlns", L"clr-namespace:A2v10.Xaml;assembly=A2v10.Xaml");
		root->setAttribute(L"xmlns:x", L"http://schemas.microsoft.com/winfx/2006/xaml");
	}
	
	m_doc->documentElement = root;
	m_docelem = root;

	return root;
}

PXmlElement CXmlFile::CreateElement(LPCWSTR elemName)
{
	ATLASSERT(m_doc != NULL);
	return m_doc->createElement(elemName);
}


PXmlNode CXmlFile::GetRoot()
{
	ATLASSERT(m_docelem != NULL);
	return m_docelem;
}

bool CXmlFile::Load()
{
	if (m_doc == NULL)
		CXmlTools::TestHR(m_doc.CreateInstance(XML_PARSER_INSTANCE));
	ATLASSERT(m_doc != NULL);
	bstr_t fileName = (LPCWSTR)m_file;
	if (!m_doc->load(fileName)) 
	{
		return false;
	}
	m_docelem = m_doc->documentElement;
	return true;
}

bool CXmlFile::Write()
{
	_bstr_t fileName = (LPCWSTR)m_file;
	CXmlTools::TestHR(m_doc->save(fileName));
	return true;
}

// static 
void CXmlAttributes::SetStringAttr(PXmlElement nd, LPCWSTR nm, LPCWSTR val)
{
	nd->setAttribute(nm, val);
}

// static 
void CXmlAttributes::SetLongAttr(PXmlElement nd, LPCWSTR nm, LONG val)
{
	nd->setAttribute(nm, val);
}

CString CXmlAttributes::GetStringValue(LPCWSTR szName, LPCWSTR szDefault /*= EMPTYSTR*/)
{
	if (m_attr == NULL)
		return EMPTYSTR;
	if (!szName || !*szName)
		return CString(szDefault);
	PXmlNode tx = m_attr->getNamedItem(szName);
	if (tx == NULL)
		return CString(szDefault);
	return CString((wchar_t*)tx->text);
}
