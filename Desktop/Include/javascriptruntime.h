#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA


class JavaScriptContext
{
	JsContextRef m_prevContext;
public:
	JavaScriptContext();
	~JavaScriptContext();
};

class JavaScriptRuntime
{
public:
	static JsRuntimeHandle CurrentRuntime();
	static JsContextRef CreateContext();
	static CString Evaluate(LPCWSTR szScript);
	static bool RunScript(LPCWSTR szScript, LPCWSTR szFileName);

	static void SetException(JavaScriptValue exception);
	static void SetUnknownException();

	static void CreateGlobalObject();
	static void StartDebugging();
	static void StopDebugging();

	static bool InDebugMode();
	static void SetDebugMode(bool bSet);
	static void EnterDebugMode();
	static void ExitDebugMode();
};

#undef AFX_DATA
#define AFX_DATA


