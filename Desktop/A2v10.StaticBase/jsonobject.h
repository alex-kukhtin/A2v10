// Copyright © 2020 Alex Kukhtin. All rights reserved.

#pragma once

class JsonObject
{
	std::wstring _value;
public:
	void Add(const wchar_t* name, const wchar_t* value);
	void Add(const wchar_t* name, bool value);
	void Add(const wchar_t* name, long value);
	void Add(const wchar_t* name, int value);
	void Add(const wchar_t* name, JsonObject* value);
	void Add(const wchar_t* name, __currency value);
	void AddArray(const wchar_t* name, JsonObject* value);

	void AddArray(JsonObject* value);
	void AddArray(const wchar_t* value);

	std::wstring ToString();
	std::wstring ToArray();
	std::wstring Value();
private:
	void addName(const wchar_t* name);
};