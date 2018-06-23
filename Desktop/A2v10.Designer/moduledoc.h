#pragma once


class CModuleDoc : public CDocument
{
	DECLARE_DYNCREATE(CModuleDoc)

	JavaScriptValue m_jsValue;

public:
	CModuleDoc();
	virtual ~CModuleDoc();

	virtual void Serialize(CArchive& ar);
	virtual void SetModifiedFlag(BOOL bModified = TRUE);
	virtual void SetPathName(LPCTSTR lpszPathName, BOOL bAddToMRU = TRUE);

	JsValueRef GetJsHandle() { return (JsValueRef)m_jsValue; }

protected:
	virtual BOOL OnNewDocument();

	DECLARE_MESSAGE_MAP()
};

