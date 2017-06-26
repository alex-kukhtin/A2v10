
#include "stdafx.h"

#include "../include/javascriptpropertyid.h"
#include "../include/javascriptvalue.h"
#include "../include/javascriptexceptions.h"
#include "../include/javascriptnative.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

JavaScriptValue::JavaScriptValue()
	: m_handle(JS_INVALID_REFERENCE) {};

JavaScriptValue::JavaScriptValue(const JsValueRef& ref)
	: m_handle(ref) {}

bool JavaScriptValue::IsValid() const
{
	return (m_handle != JS_INVALID_REFERENCE);
}

UINT JavaScriptValue::AddRef()
{
	UINT count;
	JavaScriptNative::ThrowIfError(JsAddRef(m_handle, &count));
	return count;
}

UINT JavaScriptValue::Release()
{
	UINT count;
	JavaScriptNative::ThrowIfError(JsRelease(m_handle, &count));
	return count;
}


// static 
JavaScriptValue JavaScriptValue::Undefined()
{
	JavaScriptValue value;
	JavaScriptNative::ThrowIfError(JsGetUndefinedValue(value));
	return value;
}

// static 
JavaScriptValue JavaScriptValue::Null()
{
	JavaScriptValue value;
	JavaScriptNative::ThrowIfError(JsGetNullValue(value));
	return value;
}

// static 
JavaScriptValue JavaScriptValue::True()
{
	JavaScriptValue value;
	JavaScriptNative::ThrowIfError(JsGetTrueValue(value));
	return value;
}

// static 
JavaScriptValue JavaScriptValue::False()
{
	JavaScriptValue value;
	JavaScriptNative::ThrowIfError(JsGetFalseValue(value));
	return value;
}

// static
JavaScriptValue JavaScriptValue::Invalid()
{
	return JavaScriptValue();
}

// static 
JavaScriptValue JavaScriptValue::GlobalObject()
{
	JavaScriptValue value;
	JavaScriptNative::ThrowIfError(JsGetGlobalObject(value));
	return value;
}

// static 
JavaScriptValue JavaScriptValue::CreateObject()
{
	JavaScriptValue value;
	JavaScriptNative::ThrowIfError(JsCreateObject(value));
	return value;
}

// static 
JavaScriptValue JavaScriptValue::CreateError(JavaScriptValue message)
{
	JavaScriptValue value;
	JavaScriptNative::ThrowIfError(JsCreateError(message, value));
	return value;
}

// static 
JavaScriptValue JavaScriptValue::CreateArray(UINT length)
{
	JavaScriptValue value;
	JavaScriptNative::ThrowIfError(JsCreateArray(length, value));
	return value;
}

// static 
JavaScriptValue JavaScriptValue::CreateFunction(JsNativeFunction function, void* callbackData /*= nullptr*/)
{
	JavaScriptValue reference;
	JavaScriptNative::ThrowIfError(JsCreateFunction(function, callbackData, reference));
	return reference;
}

CString JavaScriptValue::GetHashKey()
{
	CString strKey;
	strKey.Format(L"0x%lx", (DWORD_PTR)m_handle);
	return strKey;
}

JavaScriptValue JavaScriptValue::GetPropertyChain(const wchar_t* propName)
{
	JavaScriptValue val(m_handle);
	CString r;
	for (int i = 0; true; i++) {
		if (!AfxExtractSubString(r, propName, i, L'.')) {
			break;
		}
		val = val.GetProperty(r);
	}
	return val;
}

JavaScriptValue JavaScriptValue::GetProperty(JavaScriptPropertyId id)
{
	JavaScriptValue propertyReference;
	JavaScriptNative::ThrowIfError(JsGetProperty(m_handle, id, &propertyReference.m_handle));
	return propertyReference;
}

JavaScriptValue JavaScriptValue::GetProperty(const wchar_t* propName)
{
	JsPropertyIdRef propId = JS_INVALID_REFERENCE;
	JavaScriptNative::ThrowIfError(JsGetPropertyIdFromName(propName, &propId));
	return GetProperty(propId);
}

JavaScriptValue JavaScriptValue::GetProperty(int iIndex)
{
	JavaScriptValue result;
	JavaScriptValue index = JavaScriptValue::FromInt32(iIndex);
	JavaScriptNative::ThrowIfError(JsGetIndexedProperty(m_handle, index, result));
	return result;
}

JavaScriptValue& JavaScriptValue::SetProperty(JavaScriptPropertyId id, JavaScriptValue value, bool useStrictRules /* = true*/)
{
	JavaScriptNative::ThrowIfError(JsSetProperty(m_handle, id, value.m_handle, useStrictRules));
	return *this;
}

JavaScriptValue& JavaScriptValue::SetProperty(const wchar_t* propName, JavaScriptValue value, bool useStrictRules /*= true*/)
{
	JsPropertyIdRef propId = JS_INVALID_REFERENCE;
	JavaScriptNative::ThrowIfError(JsGetPropertyIdFromName(propName, &propId));
	return SetProperty(propId, value, useStrictRules);
}

JavaScriptValue& JavaScriptValue::SetProperty(const wchar_t* propName, double value, bool useStrictRules /*= true*/)
{
	return SetProperty(propName, JavaScriptValue::FromDouble(value), useStrictRules);
}

JavaScriptValue& JavaScriptValue::SetIndexedProperty(int iIndex, JavaScriptValue value)
{
	if (ValueType() != JsValueType::JsArray)
		throw JavaScriptUsageException(JsErrorCode::JsErrorInvalidArgument, L"Invalid argument (SetIndexedProperty).");
	JavaScriptValue index = JavaScriptValue::FromInt32(iIndex);
	JavaScriptNative::ThrowIfError(JsSetIndexedProperty(m_handle, index, value.m_handle));
	return *this;
}

JavaScriptValue& JavaScriptValue::Push(JavaScriptValue value)
{
	if (ValueType() != JsValueType::JsArray)
		throw JavaScriptUsageException(JsErrorCode::JsErrorInvalidArgument, L"Invalid argument (Push).");
	auto push = GetProperty(L"push");
	if (push.ValueType() != JsValueType::JsFunction)
		throw JavaScriptUsageException(JsErrorCode::JsErrorInvalidArgument, L"Invalid argument (Push).");
	push.CallFunction(*this, value);
	return *this;
}

JavaScriptValue JavaScriptValue::GetPrototype()
{
	JavaScriptValue prototypeReference;
	JavaScriptNative::ThrowIfError(JsGetPrototype(m_handle, prototypeReference));
	return prototypeReference;
}

void JavaScriptValue::SetPrototype(JavaScriptValue value)
{
	JavaScriptNative::ThrowIfError(JsSetPrototype(m_handle, value));
}

JsValueType JavaScriptValue::ValueType()
{
	JsValueType type;
	JavaScriptNative::ThrowIfError(JsGetValueType(m_handle, &type));
	return type;
}


JavaScriptValue JavaScriptValue::ConvertToString()
{
	JavaScriptValue stringReference;
	JavaScriptNative::ThrowIfError(JsConvertValueToString(m_handle, stringReference));
	return stringReference;
}

JavaScriptValue JavaScriptValue::ConvertToNumber()
{
	JavaScriptValue numberReference;
	JavaScriptNative::ThrowIfError(JsConvertValueToNumber(m_handle, numberReference));
	return numberReference;
}

JavaScriptValue JavaScriptValue::ConvertToBoolean()
{
	JavaScriptValue boolReference;
	JavaScriptNative::ThrowIfError(JsConvertValueToBoolean(m_handle, boolReference));
	return boolReference;
}

JavaScriptValue JavaScriptValue::ConvertToObject()
{
	JavaScriptValue boolReference;
	JavaScriptNative::ThrowIfError(JsConvertValueToObject(m_handle, boolReference));
	return boolReference;
}

// static 
JavaScriptValue JavaScriptValue::FromDouble(double value)
{
	JavaScriptValue reference;
	JavaScriptNative::ThrowIfError(JsDoubleToNumber(value, reference));
	return reference;
}

// static 
JavaScriptValue JavaScriptValue::FromString(const wchar_t* szString)
{
	JavaScriptValue reference;
	size_t len = wcslen(szString);
	JavaScriptNative::ThrowIfError(JsPointerToString(szString, len, reference));
	return reference;
}

// static 
JavaScriptValue JavaScriptValue::FromInt32(int value)
{
	JavaScriptValue reference;
	JavaScriptNative::ThrowIfError(JsIntToNumber(value, reference));
	return reference;
}

// static 
JavaScriptValue JavaScriptValue::FromBool(bool value)
{
	JavaScriptValue reference;
	JavaScriptNative::ThrowIfError(JsBoolToBoolean(value, reference));
	return reference;
}


CString JavaScriptValue::ToStringCheck()
{
	const wchar_t* buf;
	size_t len = 0;
	auto vt = ValueType();
	if (vt == JsValueType::JsString) {
		JavaScriptNative::ThrowIfError(JsStringToPointer(m_handle, &buf, &len));
		return CString(buf);
	}
	return L"";
}

CString JavaScriptValue::ToString()
{
	const wchar_t* buf;
	size_t len = 0;
	JavaScriptValue strValue = ConvertToString();
	JavaScriptNative::ThrowIfError(JsStringToPointer(strValue.m_handle, &buf, &len));
	return CString(buf);
}

double JavaScriptValue::ToDouble()
{
	double dblVal = 0.0;
	JavaScriptValue numberValue = ConvertToNumber();
	JavaScriptNative::ThrowIfError(JsNumberToDouble(numberValue.m_handle, &dblVal));
	return dblVal;
}

bool JavaScriptValue::ToBool()
{
	bool boolVal = false;
	JavaScriptValue boolValue = ConvertToBoolean();
	JavaScriptNative::ThrowIfError(JsBooleanToBool(boolValue.m_handle, &boolVal));
	return boolVal;
}

int JavaScriptValue::ToInt()
{
	int intVal = 0;
	JavaScriptValue numberValue = ConvertToNumber();
	JavaScriptNative::ThrowIfError(JsNumberToInt(numberValue.m_handle, &intVal));
	return intVal;
}

JavaScriptValue JavaScriptValue::ConstructObject(JavaScriptValue argValue)
{
	JavaScriptValue value;
	JsValueRef args[2];
	JavaScriptNative::ThrowIfError(JsGetUndefinedValue(&args[0]));
	args[1] = argValue.m_handle;
	JavaScriptNative::ThrowIfError(JsConstructObject(m_handle, args, 2, value));
	return value;
}

JavaScriptValue JavaScriptValue::CallFunctionArg(JavaScriptValue arg)
{
	JavaScriptValue value;
	JsValueRef args[2];
	JavaScriptNative::ThrowIfError(JsGetUndefinedValue(&args[0]));
	args[1] = arg.m_handle;
	JavaScriptNative::ThrowIfError(JsCallFunction(m_handle, args, 2, value));
	return value;
}

JavaScriptValue JavaScriptValue::CallFunction(JavaScriptValue argThis, JavaScriptValue arg1)
{
	JavaScriptValue value;
	JsValueRef args[2];
	args[0] = argThis.m_handle;
	args[1] = arg1.m_handle;
	JavaScriptNative::ThrowIfError(JsCallFunction(m_handle, args, 2, value));
	return value;
}

JavaScriptValue JavaScriptValue::CallFunction(JavaScriptValue argThis, JavaScriptValue arg1, JavaScriptValue arg2)
{
	JavaScriptValue value;
	JsValueRef args[3];
	args[0] = argThis.m_handle;
	args[1] = arg1.m_handle;
	args[2] = arg2.m_handle;
	JavaScriptNative::ThrowIfError(JsCallFunction(m_handle, args, 3, value));
	return value;
}

JavaScriptValue JavaScriptValue::CallFunction()
{
	JavaScriptValue value;
	JsValueRef arg;
	JavaScriptNative::ThrowIfError(JsGetUndefinedValue(&arg));
	JavaScriptNative::ThrowIfError(JsCallFunction(m_handle, &arg, 1, value));
	return value;
}

bool JavaScriptValue::operator==(const JavaScriptValue& other)
{
	bool result = false;
	if (!IsValid() && !other.IsValid())
		return true;
	if (!IsValid() || !other.IsValid())
		return false;
	JavaScriptNative::ThrowIfError(JsStrictEquals(m_handle, other.m_handle, &result));
	return result;

}

void JavaScriptValue::PropertyNames(CArray<CString, LPCWSTR>& list)
{
	JavaScriptValue names;
	JavaScriptNative::ThrowIfError(JsGetOwnPropertyNames(m_handle, names));
	int propCount = names.GetProperty(L"length").ToInt();
	for (int i = 0; i < propCount; i++) {
		JavaScriptValue prop = names.GetProperty(i);
		CString val = prop.ConvertToString().ToString();
		list.Add(val);
	}
}

// static 
void JavaScriptValue::CallImpl(LPCWSTR szFunction, JavaScriptValue arg1, JavaScriptValue arg2)
{
	auto impl = JavaScriptValue::GlobalObject().GetProperty(L"$impl");
	auto func = impl.GetProperty(szFunction);
	if (func.ValueType() != JsValueType::JsFunction)
		throw JavaScriptUsageException(JsErrorCode::JsErrorInvalidArgument, L"$impl. Function not found");
	func.CallFunction(JavaScriptValue::Undefined(), arg1, arg2);
}
