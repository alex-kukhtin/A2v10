#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

struct JavaScriptPropertyId
{
public:
	JavaScriptPropertyId(JsPropertyIdRef id = JS_INVALID_REFERENCE);
	operator JsPropertyIdRef*() { return &m_id; }
	operator JsPropertyIdRef() { return m_id; }

	CString Name();

	static JavaScriptPropertyId FromString(const wchar_t* szName);

protected:
	JsPropertyIdRef m_id;
};

#undef AFX_DATA
#define AFX_DATA
