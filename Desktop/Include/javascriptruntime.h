#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class JavaScriptRuntime
{
public:
	static CString Evaluate(LPCWSTR szScript);
	static void SetException(JavaScriptValue exception);
	static void SetUnknownException();
};

#undef AFX_DATA
#define AFX_DATA


