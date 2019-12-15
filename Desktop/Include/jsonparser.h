// Copyright © 2019 Alex Kukhtin. All rights reserved.

#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

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
	virtual JsonTarget* CreateObject(const wchar_t* szName) = 0;
	virtual JsonTarget* CreateArray(const wchar_t* szName) = 0;
	virtual void SetStringValue(const wchar_t* szName, const wchar_t* szValue) = 0;
	virtual void SetNumberValue(const wchar_t* szName, const wchar_t* szValue) = 0;
	virtual void SetBoolValue(const wchar_t* szName, bool bValue) = 0;
};

class JsonTargetArray abstract: public JsonTarget
{
public:
	virtual JsonTarget* CreateObject(const wchar_t* szName) = 0;
	virtual JsonTarget* CreateArray(const wchar_t* szName) { return nullptr; };
	virtual void SetStringValue(const wchar_t* szName, const wchar_t* szValue) {};
	virtual void SetNumberValue(const wchar_t* szName, const wchar_t* szValue) {};
	virtual void SetBoolValue(const wchar_t* szName, bool bValue) {};
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

#undef AFX_DATA
#define AFX_DATA
