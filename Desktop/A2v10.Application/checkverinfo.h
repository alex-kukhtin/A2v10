// Copyright © 2019 Alex Kukhtin. All rights reserved.

#pragma once


class CVersionModule : public JsonTarget
{
public:
	CString m_module;
	CString m_title;
	CString m_file;
	int m_version;
	int m_installed;

	CVersionModule()
		: m_version(0), m_installed(0) {}

	bool IsVersionOk() const { return m_version == m_installed; }
	CString InstalledVersion() const;
	CString RequiredVersion() const;
	LPCWSTR Caption() const;

	//  json target
	virtual JsonTarget* CreateObject(const wchar_t* szName) { return this; }
	virtual JsonTarget* CreateArray(const wchar_t* szName) { throw JsonException(L"CVersionModule::CreateArray. Not implemented."); }
	virtual void SetStringValue(const wchar_t* szName, const wchar_t* szValue);
	virtual void SetNumberValue(const wchar_t* szName, const wchar_t* szValue);
	virtual void SetBoolValue(const wchar_t* szName, bool bValue) {};
};

class CVersionModules : public CArray<CVersionModule*, CVersionModule*>, public JsonTargetArray
{
public:
	virtual ~CVersionModules();
	void Clear();
	bool Parse(const wchar_t* json);
	bool IsOk();

	//  json target array
	virtual JsonTarget* CreateObject(const wchar_t* szName);
};

