// Copyright © 2019 Alex Kukhtin. All rights reserved.

#pragma once

#define AUTH_WINDOWS 0
#define AUTH_SQL 1

class CLoginUser : public CObject
{
public:
	CString m_login;
	int m_authType; // 0-windows, 1-sql-server
	CString m_password;
	bool m_bRemember;


	CLoginUser()
		: m_authType(0), m_bRemember(false) {}

protected:
	virtual void Serialize(CArchive& ar) override;

	DECLARE_SERIAL(CLoginUser)
};

class CLoginServer : public CObject
{
public:
	CString m_name;
	
	CArray<CLoginUser*, CLoginUser*> m_users;
	CArray<CString, LPCWSTR> m_databases;

	int m_lastUserIndex;
	int m_lastDbIndex;

	CLoginServer()
		:m_lastUserIndex(-1), m_lastDbIndex(0) {}
	virtual ~CLoginServer();

	void FindOrCreateDatabase(LPCWSTR szDatabase);
	LPCWSTR GetCurrentDatabase();
	CLoginUser* GetCurrentUser();

protected:
	virtual void Serialize(CArchive& ar) override;

	DECLARE_SERIAL(CLoginServer)
};

class CLoginInfo : public CObject 
{
public:
	CLoginInfo()
	: m_lastIndex(-1) {}

	CArray<CLoginServer*, CLoginServer*> m_servers;
	int m_lastIndex;
	virtual ~CLoginInfo();

	virtual void Serialize(CArchive& ar) override;

	CLoginServer& GetOrCreateServer(LPCWSTR szServer);
	CLoginServer& GetCurrent();
	void FillDefault();

protected:
	DECLARE_SERIAL(CLoginInfo)
};
