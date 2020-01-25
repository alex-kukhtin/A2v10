// Copyright © 2019 Alex Kukhtin. All rights reserved.

#pragma once

#define AUTH_WINDOWS 0
#define AUTH_SQL 1

class CLoginUser : public JsonTarget
{

public:

	std::wstring m_login;
	std::wstring m_password;

	int m_authType; // 0-windows, 1-sql-server
	bool m_bRemember;
	bool m_bSelected;

	CLoginUser()
		: m_authType(0), m_bRemember(false), m_bSelected(false) {}

	static CString GetWindowsUser();

	CString GetName();
	int GetAuth();
	void SetName(int nAuth, LPCWSTR szName);

	void Serialize(CString& target);

	BEGIN_JSON_PROPS(4)
		BOOL_PROP(remember, m_bRemember)
		BOOL_PROP(selected, m_bSelected)
		STRING_PROP(login, m_login)
		STRING_PROP(password, m_password)
	END_JSON_PROPS()

	//  json target
	virtual void SetStringValue(const wchar_t* szName, const wchar_t* szValue) override;
};

class CLoginDatabase : public JsonTarget
{
public:
	std::wstring m_name;
	bool m_bSelected;

	CLoginDatabase()
		: m_bSelected(false) {}
	void Serialize(CString& target);

	BEGIN_JSON_PROPS(2)
		STRING_PROP(name, m_name)
		BOOL_PROP(selected, m_bSelected)
	END_JSON_PROPS()
};

class CLoginServer : public JsonTarget
{
public:
	std::wstring m_name;
	bool m_bSelected;
	
	JsonTargetTypedArray <CLoginUser> m_users;
	JsonTargetTypedArray<CLoginDatabase> m_databases;

	CLoginServer():
		m_bSelected(false) {}

	void FindOrCreateDatabase(LPCWSTR szDatabase);
	CLoginUser* FindUser(int nAuth, LPCWSTR szLogin, bool bCreate);
	CLoginUser* GetCurrentUser(int nAuth);

	void Serialize(CString& target);

	void SelectDatabase(CLoginDatabase* pTarget);
	void SelectUser(CLoginUser* pTarget);

	BEGIN_JSON_PROPS(4)
		STRING_PROP(name, m_name)
		BOOL_PROP(selected, m_bSelected)
		ARRAY_PROP(databases, m_databases)
		ARRAY_PROP(users, m_users)
	END_JSON_PROPS()
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
	virtual JsonTarget* CreateObject(const wchar_t* szName) override;

	void SelectServer(CLoginServer* pTarget);
};
