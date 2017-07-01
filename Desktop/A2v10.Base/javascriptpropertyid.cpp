
#include "stdafx.h"

#include "../include/javascriptpropertyid.h"
#include "../include/javascriptvalue.h"
#include "../include/javascriptnative.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


JavaScriptPropertyId::JavaScriptPropertyId(JsPropertyIdRef id /*= JS_INVALID_REFERENCE*/)
	: m_id(id) {};

// static 
JavaScriptPropertyId Invalid()
{
	return JavaScriptPropertyId();
}

const wchar_t* JavaScriptPropertyId::Name()
{
	const wchar_t* name;
	JavaScriptNative::ThrowIfError(JsGetPropertyNameFromId(m_id, &name));
	return name;
}

// static 
JavaScriptPropertyId JavaScriptPropertyId::FromString(const wchar_t* szName)
{
	JavaScriptPropertyId id;
	JavaScriptNative::ThrowIfError(JsGetPropertyIdFromName(szName, &id.m_id));
	return id;
}


