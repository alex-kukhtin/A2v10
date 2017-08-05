#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA


class JavaScriptContext sealed
{
	JsContextRef m_prevContext;
public:
	JavaScriptContext();
	~JavaScriptContext();
};

class JavaScriptRuntime sealed
{
public:
	static JsRuntimeHandle CurrentRuntime();
	static JsContextRef CreateContext();
	static CString Evaluate(const wchar_t* szScript);
	static bool RunScript(LPCWSTR szScript, LPCWSTR szFileName);
	static JavaScriptValue RunModule(LPCWSTR szCode, LPCWSTR szPathName);

	static JavaScriptValue CreateDesignerElement(const wchar_t* szJson);

	static void SetException(JavaScriptValue exception);
	static void SetUnknownException();

	static void CreateGlobalObject();
	static void StartDebugging();
	static void StopDebugging();

	static bool InDebugMode();
	static void SetDebugMode(bool bSet);
	static void EnterDebugMode();
	static void ExitDebugMode();
	static void EndRunScript();

	static CString GetFileNameFromScriptId(int scriptId);
};

#undef AFX_DATA
#define AFX_DATA


