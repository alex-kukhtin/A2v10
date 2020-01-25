// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

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
		return (LPCWSTR) m_login.c_str();
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
		m_login.c_str(), m_password.c_str(), m_authType == AUTH_WINDOWS ? L"windows" : L"sql",
		_bool2String(m_bRemember), _bool2String(m_bSelected));
	target += s;
}

// virtual 
void CLoginUser::SetStringValue(const wchar_t* szName, const wchar_t* szValue)
{
	if (wcscmp(szName, L"auth") == 0) {
		if (wcscmp(szValue, L"windows") == 0)
			m_authType = AUTH_WINDOWS;
		else if (wcscmp(szValue, L"sql") == 0)
			m_authType = AUTH_SQL;
	}
	else {
		__super::SetStringValue(szName, szValue);
	}
}

/////////////////
// CLoginDatabase

void CLoginDatabase::Serialize(CString& target)
{
	CString s;
	s.Format(L"{\"name\": \"%s\", \"selected\": %s}",
		m_name.c_str(), _bool2String(m_bSelected));
	target += s;
}

////////////////
// CLoginServer

void _removeLastComma(CString str)
{
	if (str[str.GetLength() - 1] == L',')
		str.Truncate(str.GetLength() - 1);
}

void CLoginServer::Serialize(CString& target)
{
	CString s;
	CString name = m_name.c_str();
	name.Replace(L"\\", L"\\\\");
	s.Format(L"{\"name\": \"%s\", \"selected\": %s, ",
		(LPCWSTR)name, _bool2String(m_bSelected));
	target += s;

	target += L"\"users\":[";
	for (auto it = m_users.begin(); it != m_users.end(); ++it) {
		it->get()->Serialize(target);
		target += L",";
	}
	_removeLastComma(target);

	target += L"],\"databases\":[";
	for (auto it = m_databases.begin(); it != m_databases.end(); ++it) {
		CLoginDatabase* pDB = it->get();
		pDB->Serialize(target);
		target += L",";
	}
	_removeLastComma(target);
	target += L"]}";
}

void CLoginServer::FindOrCreateDatabase(LPCWSTR szDatabase)
{
	for (auto it = m_databases.begin(); it != m_databases.end(); ++it) {
		CLoginDatabase* pDb = it->get();
		if (pDb->m_name == szDatabase) {
			SelectDatabase(pDb);
			return;
		}
	}
	CLoginDatabase* pDb = new CLoginDatabase();
	pDb->m_name = szDatabase;
	m_databases.push_back(std::unique_ptr<CLoginDatabase>(pDb));
	SelectDatabase(pDb);
}

void CLoginServer::SelectDatabase(CLoginDatabase* pTarget)
{
	for (auto it = m_databases.begin(); it != m_databases.end(); ++it) {
		CLoginDatabase* pDb = it->get();
		pDb->m_bSelected = (pDb == pTarget);
	}
}

CLoginUser* CLoginServer::FindUser(int nAuth, LPCWSTR szLogin, bool bCreate)
{
	for (auto it = m_users.begin(); it != m_users.end(); ++it) {
		CLoginUser* pUsr = it->get();
		if (wcscmp(pUsr->GetName(), szLogin) == 0) {
			SelectUser(pUsr);
			return pUsr;
		}
	}
	if (!bCreate)
		return nullptr;
	CLoginUser* pUsr = new CLoginUser();
	pUsr->SetName(nAuth, szLogin);
	m_users.push_back(std::unique_ptr<CLoginUser>(pUsr));
	SelectUser(pUsr);
	return pUsr;
}

void CLoginServer::SelectUser(CLoginUser* pTarget)
{
	for (auto it = m_users.begin(); it != m_users.end(); ++it) {
		CLoginUser* pUsr = it->get();
		pUsr->m_bSelected = (pTarget == pUsr);
	}
}

CLoginUser* CLoginServer::GetCurrentUser(int nAuth)
{
	CLoginUser* pUsr;
	for (auto it = m_users.begin(); it != m_users.end(); ++it) {
		pUsr = it->get();
		if (pUsr->m_bSelected && (nAuth == pUsr->GetAuth()))
			return pUsr;
	}
	// not found - select the first with the specified type
	for (auto it = m_users.begin(); it != m_users.end(); ++it) {
		pUsr = it->get();
		if (nAuth == pUsr->GetAuth()) {
			SelectUser(pUsr);
			return pUsr;
		}
	}
	return nullptr;
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
	pSrv->m_users.push_back(std::unique_ptr<CLoginUser>(pUser));
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

