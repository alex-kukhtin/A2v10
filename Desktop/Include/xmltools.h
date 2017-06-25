#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA


typedef MSXML2::IXMLDOMElementPtr      PXmlElement;
typedef MSXML2::IXMLDOMNodePtr         PXmlNode;
typedef MSXML2::IXMLDOMDocumentPtr     PXmlDocument;
typedef MSXML2::IXMLDOMNamedNodeMapPtr PXmlNodeMap;

class CXmlError : public _com_error
{
	CString m_msg;
public:
	CXmlError(LPCWSTR szMsg)
		: _com_error(S_OK), m_msg(szMsg) {};
	CXmlError(HRESULT hr)
		: _com_error(hr) {};
	void ReportError();
};

class CXmlTools
{
private:
	CXmlTools(); // declaration only
	~CXmlTools();
public:
	static void TestHR(HRESULT hr);
	static void TestName(PXmlNode& nd, LPCWSTR nm);
	static CString GetNodeContent(PXmlNode node);
};

class CXmlFile
{
	CString m_file;
	bool m_bProcessingInstr;
	PXmlDocument m_doc;
	PXmlElement	 m_docelem;

	friend class CXmlError;
public:
	CXmlFile(LPCWSTR szFileName = EMPTYSTR, bool bPI = false)
		: m_file(szFileName), m_bProcessingInstr(bPI) {};

	bool Load();
	bool LoadWithWhiteSpace();
	bool LoadXML(LPCWSTR szXML);
	bool Write();
	PXmlNode GetRoot();
	PXmlNode CreateRoot(LPCWSTR rootName);
	PXmlElement CreateElement(LPCWSTR elemName);
	PXmlElement CreateFirstLevelElement(LPCWSTR elemName);

	CString GetDocumentXml();

	static LPCWSTR GetProcessedFile();
};

class CXmlAttributes
{
	PXmlNodeMap m_attr;
public:
	CXmlAttributes(PXmlNodeMap attr)
		: m_attr(attr) {};
	CXmlAttributes(PXmlNode node)
		: m_attr(node->attributes) {};

	CString GetStringValue(LPCWSTR szName, LPCWSTR szDefault = EMPTYSTR);

	int GetIntValue(LPCWSTR szName, int nDefault = 0);
	bool GetIntValueCheck(LPCWSTR szName, int& value);
	bool GetBoolValue(LPCWSTR szName, bool bDefault = false);
	bool GetBoolValueCheck(LPCWSTR szName, bool& bValue);
	double GetDoubleValue(LPCWSTR szName, double fDefault = 0.0);
	bool GetDoubleValueCheck(LPCWSTR szName, double& dVal);

	COLORREF GetColorValue(LPCWSTR szName, COLORREF clrDefault = UNKNOWN_COLOR);

	static void SetLongAttr(PXmlElement nd, LPCWSTR nm, long val);
	static void SetStringAttr(PXmlElement nd, LPCWSTR nm, LPCWSTR val);
	static void SetColorAttr(PXmlElement nd, LPCWSTR nm, COLORREF clr);
	static void SetDoubleAttr(PXmlElement nd, LPCWSTR nm, double dblVal);
};

#undef AFX_DATA
#define AFX_DATA

