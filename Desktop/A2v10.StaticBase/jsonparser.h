#pragma once

// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

class JsonScaner;

class JsonException
{
	std::wstring _msg;
public:
	inline JsonException(const wchar_t* msg = nullptr)
	{
		if (msg != nullptr)
			_msg = msg;
	}
	inline const wchar_t* GetMessage() { return _msg.c_str(); }
};

class JsonTarget abstract
{
public:
	struct PROP_ENTRY {
		const wchar_t* name;
		std::wstring* pString;
		int* pInt;
		__int64* pInt64;
		double* pDouble;
		bool* pBool;
		JsonTarget* pArray;
	};

	virtual ~JsonTarget();
	virtual JsonTarget* CreateObject(const wchar_t* szName) { return this; }
	virtual JsonTarget* CreateArray(const wchar_t* szName);
	virtual void SetStringValue(const wchar_t* szName, const wchar_t* szValue);
	virtual void SetNumberValue(const wchar_t* szName, const wchar_t* szValue);
	virtual void SetBoolValue(const wchar_t* szName, bool bValue);
protected:
	virtual JsonTarget::PROP_ENTRY* __getPropsTable() { return nullptr; }
};

#define BEGIN_JSON_PROPS(cnt)\
JsonTarget::PROP_ENTRY __propsTable[cnt + 1] = {
#define END_JSON_PROPS()\
{nullptr, nullptr, nullptr, nullptr, nullptr}\
};\
JsonTarget::PROP_ENTRY* __getPropsTable() override {return __propsTable; }

#define STRING_PROP(name, val)\
{L#name, &##val, nullptr, nullptr, nullptr, nullptr, nullptr},
#define INT_PROP(name, val)\
{L#name, nullptr, &##val, nullptr, nullptr, nullptr, nullptr},
#define INT64_PROP(name, val)\
{L#name, nullptr, nullptr, &##val, nullptr, nullptr, nullptr},
#define DOUBLE_PROP(name, val)\
{L#name, nullptr, nullptr, nullptr, &##val, nullptr, nullptr},
#define BOOL_PROP(name, val)\
{L#name, nullptr, nullptr, nullptr, nullptr, &##val, nullptr},
#define ARRAY_PROP(name, val)\
{L#name, nullptr, nullptr, nullptr, nullptr, nullptr, &##val},

class JsonTargetArray abstract : public JsonTarget
{
public:
	virtual JsonTarget* CreateObject(const wchar_t* szName) = 0;
	virtual JsonTarget* CreateArray(const wchar_t* szName) { return nullptr; };
	virtual void SetStringValue(const wchar_t* szName, const wchar_t* szValue) {};
	virtual void SetNumberValue(const wchar_t* szName, const wchar_t* szValue) {};
	virtual void SetBoolValue(const wchar_t* szName, bool bValue) {};
};

template<class T>
class JsonTargetTypedArray : public std::vector<std::unique_ptr<T> >, public JsonTargetArray
{
public:
	//  json target array
	virtual JsonTarget* CreateObject(const wchar_t* szName) override
	{
		T* pItem = new T();
		this->push_back(std::unique_ptr<T>(pItem));
		// constraint?
		return (JsonTarget*) pItem;
	}
};

class JsonParser
{
	JsonScaner* _scan;
	JsonTarget* _target;
public:
	JsonParser();
	virtual ~JsonParser();
	void Parse(const wchar_t* szText);
	void SetTarget(JsonTarget* pTarget);

private:
	void SetValue(JsonTarget* target, const wchar_t* szName);
	void ParseObject(JsonTarget* target);
	void ParseArray(JsonTarget* target, const wchar_t* szName);
};



