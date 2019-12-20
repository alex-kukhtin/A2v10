// Copyright © 2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "checkverinfo.h"

// virtual 
void CVersionModule::SetStringValue(const wchar_t* szName, const wchar_t* szValue)
{
	if (wcscmp(szName, L"module") == 0)
		m_module = szValue;
	else if (wcscmp(szName, L"file") == 0)
		m_file = szValue;
	else if (wcscmp(szName, L"title") == 0)
		m_title = szValue;
}

// virtual 
void CVersionModule::SetNumberValue(const wchar_t* szName, const wchar_t* szValue)
{
	if (wcscmp(szName, L"version") == 0)
		m_version = _wtoi(szValue);
	else if (wcscmp(szName, L"installed") == 0)
		m_installed = _wtoi(szValue);
}

CString CVersionModule::InstalledVersion() const
{
	return CConvert::Long2String(m_installed);
}

CString CVersionModule::RequiredVersion() const
{
	return CConvert::Long2String(m_version);
}

LPCWSTR CVersionModule::Caption() const
{
	return (LPCWSTR) (m_title.IsEmpty() ? m_file : m_title);
}



// CVersionModules 
///////////////////////
// virtual 
CVersionModules::~CVersionModules()
{
	Clear();
}

void CVersionModules::Clear()
{
	for (int i = 0; i < GetCount(); i++)
		delete ElementAt(i);
	RemoveAll();
}

// virtual 
JsonTarget* CVersionModules::CreateObject(const wchar_t* szName)
{
	CVersionModule*  pM = new CVersionModule();
	Add(pM);
	return pM;
}


bool CVersionModules::Parse(const wchar_t* json)
{
	Clear();
	try {
		JsonParser parser;
		parser.SetTarget(this);
		parser.Parse(json);
		return true;
	}
	catch (JsonException& je) {
		AfxMessageBox(je.GetMessage());
		return false;
	}
}

bool CVersionModules::IsOk() {
	for (int i = 0; i < GetCount(); i++)
		if (!ElementAt(i)->IsVersionOk())
			return false;
	return true;
}