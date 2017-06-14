
#include "stdafx.h"

#include "../include/javascriptpropertyid.h"
#include "../include/javascriptvalue.h"
#include "../include/javascriptruntime.h"
#include "../include/javascriptnative.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif

// static 
CString JavaScriptRuntime::Evaluate(LPCWSTR szScript)
{
	JavaScriptValue result;
	JavaScriptNative::ThrowIfError(JsRunScript(szScript, JS_SOURCE_CONTEXT_NONE, L"", result));
	return result.ConvertToString().ToString();
}

// static 
void JavaScriptRuntime::SetException(JavaScriptValue exception)
{
	JavaScriptNative::ThrowIfError(JsSetException(exception));
}

// static
void JavaScriptRuntime::SetUnknownException()
{
	auto err = JavaScriptValue::CreateError(JavaScriptValue::FromString(L"Unknown error"));
	JavaScriptRuntime::SetException(err);
}
