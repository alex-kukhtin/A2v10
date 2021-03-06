// Copyright � 2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "types.h"
#include "jsonobject.h"


void JsonObject::Add(const wchar_t* name, const wchar_t* str)
{
	addName(name);
	std::wstring strval(str);
	std::replace(strval.begin(), strval.end(), L'"', L'\'');
	_value.append(L"\"").append(strval).append(L"\"");
}

void JsonObject::Add(const wchar_t* name, __currency value)
{
	addName(name);
	_value.append(value.to_wstring());
}

void JsonObject::Add(const wchar_t* name, bool value)
{
	addName(name);
	_value.append(value ? L"true" : L"false");
}

void JsonObject::Add(const wchar_t* name, long value)
{
	addName(name);
	_value.append(std::to_wstring(value));
}

void JsonObject::Add(const wchar_t* name, int value)
{
	Add(name, (long)value);
}

void JsonObject::Add(const wchar_t* name, JsonObject* value)
{
	addName(name);
	_value.append(value->ToString());
}

void JsonObject::AddArray(JsonObject* value)
{
	if (!_value.empty())
		_value.append(L",");
	_value.append(value->ToString());
}

void JsonObject::AddArray(const wchar_t* str)
{
	if (!_value.empty())
		_value.append(L",");
	std::wstring strval(str);
	std::replace(strval.begin(), strval.end(), L'"', L'\'');
	_value.append(L"\"").append(strval).append(L"\"");
}

void JsonObject::AddArray(const wchar_t* name, JsonObject* value)
{
	addName(name);
	_value.append(value->ToArray());
}

void JsonObject::addName(const wchar_t* name)
{
	if (!_value.empty())
		_value.append(L",");
	_value.append(L"\"").append(name).append(L"\":");
}

std::wstring JsonObject::ToString()
{
	std::wstring result(L"{");
	result.append(_value);
	result.append(L"}");
	return result;
}

std::wstring JsonObject::ToArray()
{
	std::wstring result(L"[");
	result.append(_value);
	result.append(L"]");
	return result;
}

std::wstring JsonObject::Value()
{
	return _value;
}
