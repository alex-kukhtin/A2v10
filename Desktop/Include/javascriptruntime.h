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

// from ChakraDebug.h!!!!
typedef enum _DebugStepType
{
	StepIn = 0,
	StepOut = 1,
	StepOver = 2,
	//StepBack = 3,
	//ReverseContinue = 4,
	Continue = 5
} DebugStepType;

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
	static void SetDebugStepType(DebugStepType step);

	static CString GetFileNameFromScriptId(int scriptId);
};

#undef AFX_DATA
#define AFX_DATA


