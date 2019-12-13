#pragma once

class CLoginUser : public CObject
{
public:
	CString m_login;
	int m_authType; // 0-windows, 1-sql-server
	CString m_password;

	CLoginUser& operator=(const CLoginUser& user);

protected:
	virtual void Serialize(CArchive& ar) override;

	DECLARE_SERIAL(CLoginUser)
};

class CLoginServer : public CObject
{
public:
	CString m_name;
	
	CArray<CLoginUser, const CLoginUser&> m_users;
	CArray<CString, LPCWSTR> m_databases;

	CLoginServer() {}
	virtual ~CLoginServer() {}
	CLoginServer& operator=(const CLoginServer& server);

protected:
	virtual void Serialize(CArchive& ar) override;

	DECLARE_SERIAL(CLoginServer)
};

class CLoginInfo : public CObject 
{
public:
	CLoginInfo()
	: m_lastIndex(-1) {}

	CArray<CLoginServer, const CLoginServer&> m_servers;
	int m_lastIndex;
	virtual ~CLoginInfo() {}

protected:
	virtual void Serialize(CArchive& ar) override;
	DECLARE_SERIAL(CLoginInfo)
};
