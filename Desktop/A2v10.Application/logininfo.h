// Copyright © 2019 Alex Kukhtin. All rights reserved.

#pragma once

#define AUTH_WINDOWS 0
#define AUTH_SQL 1

class CLoginUser : public JsonTarget
{
	CString m_login;
	int m_authType; // 0-windows, 1-sql-server

public:

	CString m_password;
	bool m_bRemember;
	bool m_bSelected;

	CLoginUser()
		: m_authType(0), m_bRemember(false), m_bSelected(false) {}

	static CString GetWindowsUser();

	CString GetName();
	int GetAuth();
	void SetName(int nAuth, LPCWSTR szName);

	void Serialize(CString& target);

	//  json target
	virtual JsonTarget* CreateArray(const wchar_t* szName) { throw JsonException(L"CLoginUser::CreateArray. Not implemented."); }
	virtual void SetStringValue(const wchar_t* szName, const wchar_t* szValue);
	virtual void SetBoolValue(const wchar_t* szName, bool bValue);
};

class CLoginDatabase : public JsonTarget
{
public:
	CString m_name;
	bool m_bSelected;

	CLoginDatabase()
		: m_bSelected(false) {}
	void Serialize(CString& target);

	//  json target
	virtual JsonTarget* CreateArray(const wchar_t* szName) { throw JsonException(L"CLoginDatabase::CreateArray. Not implemented."); }
	virtual void SetStringValue(const wchar_t* szName, const wchar_t* szValue);
	virtual void SetBoolValue(const wchar_t* szName, bool bValue);
};

class CLoginDatabases : public CArray<CLoginDatabase*, CLoginDatabase*>, public JsonTargetArray
{
public:
	virtual ~CLoginDatabases();
	//  json target array
	virtual JsonTarget* CreateObject(const wchar_t* szName);
};

class CLoginUsers : public CArray<CLoginUser*, CLoginUser*>, public JsonTargetArray
{
public:
	virtual ~CLoginUsers();
	//  json target
	virtual JsonTarget* CreateObject(const wchar_t* szName);
};

class CLoginServer : public JsonTarget
{
public:
	CString m_name;
	bool m_bSelected;
	
	CLoginUsers m_users;
	CLoginDatabases m_databases;

	CLoginServer():
		m_bSelected(false) {}

	void FindOrCreateDatabase(LPCWSTR szDatabase);
	CLoginUser* FindUser(int nAuth, LPCWSTR szLogin, bool bCreate);
	CLoginUser* GetCurrentUser(int nAuth);

	void Serialize(CString& target);

	void SelectDatabase(CLoginDatabase* pTarget);
	void SelectUser(CLoginUser* pTarget);

	//  json target
	virtual JsonTarget* CreateObject(const wchar_t* szName) { return nullptr; }
	virtual JsonTarget* CreateArray(const wchar_t* szName);
	virtual void SetStringValue(const wchar_t* szName, const wchar_t* szValue);
	virtual void SetBoolValue(const wchar_t* szName, bool bValue);
};

class CLoginInfo : public JsonTarget
{
public:
	CLoginInfo() {}

	CArray<CLoginServer*, CLoginServer*> m_servers;
	virtual ~CLoginInfo();

	void Serialize(CString& target);

	CLoginServer* FindServer(LPCWSTR szServer, bool bCreate);

	void FillDefault();
	void SaveCurrentInfo(LPCWSTR szServerName, LPCWSTR szDbName, LPCWSTR szLogin, LPCWSTR szPassword, int nAuthType, bool bRemember);

	//  json target
	virtual JsonTarget* CreateObject(const wchar_t* szName);
	virtual JsonTarget* CreateArray(const wchar_t* szName) { return this; };

	void SelectServer(CLoginServer* pTarget);
};
