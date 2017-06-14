#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class JavaScriptException
{
protected:
	JavaScriptException(JsErrorCode code, LPCWSTR message)
		: m_code(code), m_message(message) {}

	JavaScriptException(JsErrorCode code, JavaScriptValue error, LPCWSTR message = nullptr)
		: m_code(code), m_message(message), m_error(error) {};

	JsErrorCode m_code;
	CString m_message;
	JavaScriptValue m_error;

public:
	virtual void ReportError();
	virtual void SetException();
	virtual CString GetMessage();
};

class JavaScriptUsageException : public JavaScriptException
{
public:
	JavaScriptUsageException(JsErrorCode code, LPCWSTR message)
		: JavaScriptException(code, message) {}
};

class JavaScriptFatalException : public JavaScriptException
{
public:
	JavaScriptFatalException(JsErrorCode code)
		: JavaScriptException(code, L"A fatal exception has occurred in a JavaScript runtime") {}
};


class JavaScriptEngineException : public JavaScriptException
{
public:
	JavaScriptEngineException(JsErrorCode code)
		: JavaScriptException(code, L"A fatal exception has occurred in a JavaScript runtime") {}

	JavaScriptEngineException(JsErrorCode code, LPCWSTR message)
		: JavaScriptException(code, message) {}
};

class JavaScriptScriptException : public JavaScriptException
{
public:
	JavaScriptScriptException(JsErrorCode code, JavaScriptValue error, LPCWSTR message = nullptr)
		: JavaScriptException(code, error, message) {}
};

#undef AFX_DATA
#define AFX_DATA

