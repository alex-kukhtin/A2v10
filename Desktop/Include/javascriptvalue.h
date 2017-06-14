#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA


struct JavaScriptValue
{
public:
	JavaScriptValue();
	JavaScriptValue(const JsValueRef& ref);

	static JavaScriptValue Undefined();
	static JavaScriptValue Null();
	static JavaScriptValue True();
	static JavaScriptValue False();
	static JavaScriptValue Invalid();
	static JavaScriptValue GlobalObject();

	static JavaScriptValue CreateFunction(JsNativeFunction function, void* callbackData = nullptr);
	static JavaScriptValue CreateObject();
	static JavaScriptValue CreateArray(UINT length);
	static JavaScriptValue CreateError(JavaScriptValue message);

	CString GetHashKey();

	JavaScriptValue GetProperty(JavaScriptPropertyId id);
	JavaScriptValue GetProperty(const wchar_t* propName);
	JavaScriptValue GetPropertyChain(const wchar_t* propName);
	JavaScriptValue GetProperty(int iIndex);
	JavaScriptValue& SetProperty(JavaScriptPropertyId id, JavaScriptValue value, bool useStrictRules = true);
	JavaScriptValue& SetProperty(const wchar_t* propName, JavaScriptValue value, bool useStrictRules = true);
	JavaScriptValue& SetProperty(const wchar_t* propName, double value, bool useStrictRules = true);
	JavaScriptValue& SetIndexedProperty(int iIndex, JavaScriptValue value);
	JavaScriptValue CallFunction();
	JavaScriptValue CallFunction(JavaScriptValue argThis, JavaScriptValue arg1);
	JavaScriptValue CallFunction(JavaScriptValue argThis, JavaScriptValue arg1, JavaScriptValue arg2);
	JavaScriptValue GetPrototype();

	JavaScriptValue& Push(JavaScriptValue value);

	static void CallImpl(LPCWSTR szFunction, JavaScriptValue arg1, JavaScriptValue arg2);

	void SetPrototype(JavaScriptValue value);
	JavaScriptValue ConstructObject(JavaScriptValue argValue);

	JavaScriptValue ConvertToBoolean();
	JavaScriptValue ConvertToString();
	JavaScriptValue ConvertToNumber();
	JavaScriptValue ConvertToObject();
	CString ToString();
	CString ToStringCheck();
	double ToDouble();
	int ToInt();
	bool ToBool();

	static JavaScriptValue FromDouble(double value);
	static JavaScriptValue FromString(const wchar_t* szString);
	static JavaScriptValue FromInt32(int value);
	static JavaScriptValue FromBool(bool value);

	bool IsValid() const;
	JsValueType ValueType();

	UINT AddRef();
	UINT Release();

	operator JsValueRef*() { return &m_handle; }
	operator JsValueRef() { return m_handle; }
	bool operator==(const JavaScriptValue& other);
	bool operator!=(const JavaScriptValue& other)
	{
		return !operator==(other);
	}
	void JavaScriptValue::PropertyNames(CArray<CString, LPCWSTR>& list);

private:
	JsValueRef m_handle;

private:
	// declare only (prevent char <-> wchar error)
	void SetProperty(const char* propName, JavaScriptValue value, bool useStrictRules = true);
	JavaScriptValue GetProperty(const char* propName);
};

#undef AFX_DATA
#define AFX_DATA
