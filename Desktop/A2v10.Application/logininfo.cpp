// Copyright © 2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "A2v10.Application.h"
#include "logininfo.h"

#define SECURITY_WIN32
#include "Security.h"


const LPCWSTR WIN_USER = L"{WINDOWS_USER}";

inline LPCWSTR _bool2String(bool bVal) {
	return bVal ? L"true" : L"false";
}

// static
CString CLoginUser::GetWindowsUser()
{
	WCHAR buf[256];
	ULONG len = 255;
	::GetUserNameEx(NameSamCompatible, buf, &len);
	return CString(buf);
}

CString CLoginUser::GetName()
{
	if (m_authType == AUTH_WINDOWS) {
		return GetWindowsUser();
	}
	else {
		return (LPCWSTR) m_login;
	}
}

int CLoginUser::GetAuth()
{
	return m_authType;
}


void CLoginUser::SetName(int nAuth, LPCWSTR szName)
{
	m_authType = nAuth;
	if (nAuth == AUTH_WINDOWS)
		m_login = WIN_USER;
	else
		m_login = szName;
}

void CLoginUser::Serialize(CString& target)
{
	CString s;
	s.Format(L"{\"login\": \"%s\", \"password\": \"%s\", \"auth\":\"%s\", \"remember\":%s, \"selected\": %s}", 
		(LPCWSTR) m_login, (LPCWSTR) m_password, m_authType == AUTH_WINDOWS ? L"windows" : L"sql",
		_bool2String(m_bRemember), _bool2String(m_bSelected));
	target += s;
}

// virtual 
void CLoginUser::SetStringValue(const wchar_t* szName, const wchar_t* szValue)
{
	CString err;
	if (wcscmp(szName, L"login") == 0)
		m_login = szValue;
	else if (wcscmp(szName, L"password") == 0)
		m_password = szValue;
	else if (wcscmp(szName, L"auth") == 0) {
		if (wcscmp(szValue, L"windows") == 0)
			m_authType = AUTH_WINDOWS;
		else if (wcscmp(szValue, L"sql") == 0)
			m_authType = AUTH_SQL;
	}
}

// virtual 
void CLoginUser::SetBoolValue(const wchar_t* szName, bool bValue)
{
	if (wcscmp(szName, L"remember") == 0)
		m_bRemember = bValue;
	else if (wcscmp(szName, L"selected") == 0)
		m_bSelected = bValue;
}

CLoginUsers::~CLoginUsers()
{
	for (int i = 0; i < GetCount(); i++)
		delete ElementAt(i);
	RemoveAll();
}

// virtual 
JsonTarget* CLoginUsers::CreateObject(const wchar_t* szName)
{
	CLoginUser*  pUser = new CLoginUser();
	Add(pUser);
	return pUser;
}

/////////////////
// CLoginDatabase

void CLoginDatabase::Serialize(CString& target)
{
	CString s;
	s.Format(L"{\"name\": \"%s\", \"selected\": %s}",
		(LPCWSTR)m_name, _bool2String(m_bSelected));
	target += s;
}

// virtual 
void CLoginDatabase::SetBoolValue(const wchar_t* szName, bool bValue)
{
	if (wcscmp(szName, L"selected") == 0)
		m_bSelected = bValue;
}


// virtual 
void CLoginDatabase::SetStringValue(const wchar_t* szName, const wchar_t* szValue)
{
	CString err;
	if (wcscmp(szName, L"name") == 0)
		m_name = szValue;
}

CLoginDatabases::~CLoginDatabases()
{
	for (int i = 0; i < GetCount(); i++)
		delete ElementAt(i);
	RemoveAll();
}

// virtual 
JsonTarget* CLoginDatabases::CreateObject(const wchar_t* szName)
{
	CLoginDatabase*  pDb = new CLoginDatabase();
	Add(pDb);
	return pDb;
}

////////////////
// CLoginServer

void CLoginServer::Serialize(CString& target)
{
	CString s;
	CString name = m_name;
	name.Replace(L"\\", L"\\\\");
	s.Format(L"{\"name\": \"%s\", \"selected\": %s, ",
		(LPCWSTR)name, _bool2String(m_bSelected));

	target += s;

	target += L"\"users\":[";

	for (int i = 0; i < m_users.GetCount(); i++) {
		m_users[i]->Serialize(target);
		if (i != m_users.GetUpperBound())
			target += L",\n";
	}
	target += L"],\"databases\":[";
	for (int i = 0; i < m_databases.GetCount(); i++) {
		m_databases[i]->Serialize(target);
		if (i != m_databases.GetUpperBound())
			target += L",";
	}
	target += L"]}";
}

void CLoginServer::FindOrCreateDatabase(LPCWSTR szDatabase)
{
	for (int i = 0; i < m_databases.GetCount(); i++) {
		CLoginDatabase* pDb = m_databases.ElementAt(i);
		if (pDb->m_name == szDatabase) {
			SelectDatabase(pDb);
			return;
		}
	}
	CLoginDatabase* pDb = new CLoginDatabase();
	pDb->m_name = szDatabase;
	m_databases.Add(pDb);
	SelectDatabase(pDb);
}

void CLoginServer::SelectDatabase(CLoginDatabase* pTarget)
{
	for (int i = 0; i < m_databases.GetCount(); i++) {
		CLoginDatabase* pDb = m_databases.ElementAt(i);
		pDb->m_bSelected = (pDb == pTarget);
	}
}

CLoginUser* CLoginServer::FindUser(int nAuth, LPCWSTR szLogin, bool bCreate)
{
	for (int i = 0; i < m_users.GetCount(); i++) {
		CLoginUser* pUsr = m_users.ElementAt(i);
		if (wcscmp(pUsr->GetName(), szLogin) == 0) {
			SelectUser(pUsr);
			return pUsr;
		}
	}
	if (!bCreate)
		return nullptr;
	CLoginUser* pUsr = new CLoginUser();
	pUsr->SetName(nAuth, szLogin);
	m_users.Add(pUsr);
	SelectUser(pUsr);
	return pUsr;
}

void CLoginServer::SelectUser(CLoginUser* pTarget)
{
	for (int i = 0; i < m_users.GetCount(); i++) {
		CLoginUser* pUsr = m_users.ElementAt(i);
		pUsr->m_bSelected = (pTarget == pUsr);
	}
}

CLoginUser* CLoginServer::GetCurrentUser(int nAuth)
{
	CLoginUser* pUsr;
	for (int i = 0; i < m_users.GetCount(); i++) {
		pUsr = m_users.ElementAt(i);
		if (pUsr->m_bSelected && (nAuth == pUsr->GetAuth()))
			return pUsr;
	}
	// not found - select the first with the specified type
	for (int i = 0; i < m_users.GetCount(); i++) {
		pUsr = m_users.ElementAt(i);
		if (nAuth == pUsr->GetAuth()) {
			SelectUser(pUsr);
			return pUsr;
		}
	}
	return nullptr;
}

// virtual 
JsonTarget* CLoginServer::CreateArray(const wchar_t* szName)
{
	if (wcscmp(szName, L"users") == 0) {
		return &m_users;
	}
	else if (wcscmp(szName, L"databases") == 0) {
		return &m_databases;
	}
	CString msg;
	msg.Format(L"Invalid object name '%s'", szName);
	throw new JsonException(msg);
}

// virtual 
void CLoginServer::SetStringValue(const wchar_t* szName, const wchar_t* szValue)
{
	if (wcscmp(szName, L"name") == 0)
		m_name = szValue;
}

// virtual 
void CLoginServer::SetBoolValue(const wchar_t* szName, bool bValue)
{
	if (wcscmp(szName, L"selected") == 0)
		m_bSelected = bValue;
}


////////////////
// CLoginInfo

// virtual 
CLoginInfo::~CLoginInfo()
{
	for (int i = 0; i < m_servers.GetCount(); i++)
		delete m_servers.ElementAt(i);
	m_servers.RemoveAll();
}

void CLoginInfo::Serialize(CString& target)
{
	target += L"[";
	for (int i = 0; i < m_servers.GetCount(); i++) {
		CLoginServer* pSrv = m_servers.ElementAt(i);
		pSrv->Serialize(target);
		if (i != m_servers.GetUpperBound())
			target += L",";
	}
	target += L"]";
}

void CLoginInfo::SelectServer(CLoginServer* pTarget)
{
	for (int i = 0; i < m_servers.GetCount(); i++) {
		CLoginServer* pSrv = m_servers.ElementAt(i);
		pSrv->m_bSelected = (pSrv == pTarget);
	}
}

void CLoginInfo::FillDefault()
{
	CLoginServer* pSrv = new CLoginServer();
	pSrv->m_bSelected = true;
	pSrv->m_name = L"localhost\\SQLEXPRESS";
	m_servers.Add(pSrv);

	CLoginUser* pUser = new CLoginUser();
	pUser->SetName(AUTH_WINDOWS, nullptr);
	pUser->m_bSelected = true;
	pSrv->m_users.Add(pUser);
}

// virtual 
JsonTarget* CLoginInfo::CreateObject(const wchar_t* szName)
{
	CLoginServer* pSrv = new CLoginServer();
	m_servers.Add(pSrv);
	return pSrv;
}


CLoginServer* CLoginInfo::FindServer(LPCWSTR szServer, bool bCreate)
{
	CLoginServer* pSrv;
	for (int i = 0; i < m_servers.GetCount(); i++) {
		pSrv = m_servers.ElementAt(i);
		if (pSrv->m_name == szServer) {
			SelectServer(pSrv);
			return pSrv;
		}
	}
	if (!bCreate)
		return nullptr;
	pSrv = new CLoginServer();
	pSrv->m_name = szServer;
	m_servers.Add(pSrv);
	SelectServer(pSrv);
	return pSrv;
}

void CLoginInfo::SaveCurrentInfo(LPCWSTR szServerName, LPCWSTR szDbName, LPCWSTR szLogin, LPCWSTR szPassword, int nAuthType, bool bRemember)
{
	CLoginServer* pSrv = FindServer(szServerName, true);
	pSrv->FindOrCreateDatabase(szDbName);
	CLoginUser* pUser = pSrv->FindUser(nAuthType, szLogin, true);
	pUser->m_password = szPassword;
	pUser->m_bRemember = bRemember;
}

