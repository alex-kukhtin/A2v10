

#include "stdafx.h"

#include "../include/javascriptpropertyid.h"
#include "../include/javascriptvalue.h"
#include "../include/javascriptnative.h"
#include "../include/javascriptexceptions.h"
#include "../include/javascriptruntime.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

void JavaScriptException::ReportError()
{
	AfxMessageBox(GetMessage());
}

// virtual
void JavaScriptException::SetException()
{
	if (m_error.IsValid()) {
		auto ex = JavaScriptValue::CreateError(m_error);
		JavaScriptRuntime::SetException(ex);
	}
	else
	{
		auto ex = JavaScriptValue::CreateError(JavaScriptValue::FromString(m_message));
		JavaScriptRuntime::SetException(ex);
	}
}

// virtual 
CString JavaScriptException::GetMessage()
{
	if (m_error.IsValid())
		return m_error.ConvertToString().ToString();
	return m_message;
}

