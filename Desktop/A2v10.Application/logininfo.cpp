// Copyright © 2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "A2v10.Application.h"
#include "logininfo.h"

IMPLEMENT_SERIAL(CLoginUser, CObject, 1)
IMPLEMENT_SERIAL(CLoginServer, CObject, 1)
IMPLEMENT_SERIAL(CLoginInfo, CObject, 1)

void CLoginUser::Serialize(CArchive & ar)
{
	if (ar.IsStoring()) 
	{
		ar << m_login;
		ar << m_authType;
		ar << m_password;
		ar << m_bRemember;
	}
	else 
	{
		ar >> m_login;
		ar >> m_authType;
		ar >> m_password;
		ar >> m_bRemember;
	}
}

////////////////
// CLoginServer

// virtual 
CLoginServer::~CLoginServer()
{
	for (int i = 0; i < m_users.GetCount(); i++)
		delete m_users.ElementAt(i);
	m_users.RemoveAll();
}

void CLoginServer::Serialize(CArchive & ar)
{
	if (ar.IsStoring()) 
	{
		ar << m_name;
		ar << m_lastUserIndex;
		ar << m_lastDbIndex;
		ar << (int) m_users.GetCount();
		for (int i = 0; i < m_users.GetCount(); i++)
			ar << m_users.ElementAt(i);
	} 
	else 
	{
		ar >> m_name;
		ar >> m_lastUserIndex;
		ar >> m_lastDbIndex;

		int cnt;
		CLoginUser* pUser;
		ar >> cnt;
		for (int i = 0; i < cnt; i++) {
			ar >> pUser;
			m_users.Add(pUser);
		}
	}
	m_databases.Serialize(ar);
}

void CLoginServer::FindOrCreateDatabase(LPCWSTR szDatabase)
{
	for (int i = 0; i < m_databases.GetCount(); i++) {
		CString& db = m_databases.ElementAt(i);
		if (db == szDatabase) {
			return;
		}
	}
	m_databases.Add(szDatabase);
}

LPCWSTR CLoginServer::GetCurrentDatabase()
{
	if (m_lastDbIndex < 0 || m_lastDbIndex >= m_databases.GetSize())
		return nullptr;
	return (LPCWSTR) m_databases.ElementAt(m_lastDbIndex);
}

CLoginUser* CLoginServer::GetCurrentUser()
{
	if (m_lastUserIndex < 0 || m_lastUserIndex >= m_users.GetSize())
		return nullptr;
	return m_users.GetAt(m_lastUserIndex);
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


void CLoginInfo::Serialize(CArchive & ar)
{
	if (ar.IsStoring()) 
	{
		ar << m_lastIndex;
		ar << (int)m_servers.GetCount();
		for (int i = 0; i < m_servers.GetCount(); i++)
			ar << m_servers.ElementAt(i);
	} 
	else 
	{
		ar >> m_lastIndex;
		int cnt = 0;
		ar >> cnt;
		CLoginServer* pSrv;
		for (int i = 0; i < cnt; i++) {
			ar >> pSrv;
			m_servers.Add(pSrv);
		}
	}
}

CLoginServer& CLoginInfo::GetCurrent() 
{
	return *m_servers.ElementAt(m_lastIndex);
}

CLoginServer& CLoginInfo::GetOrCreateServer(LPCWSTR szServer) 
{
	CLoginServer* pSrv;
	for (int i = 0; i < m_servers.GetCount(); i++) {
		pSrv = m_servers.ElementAt(i);
		if (pSrv->m_name == szServer) {
			m_lastIndex = i;
			return *pSrv;
		}
	}
	pSrv = new CLoginServer();
	pSrv->m_name = szServer;
	m_servers.Add(pSrv);
	m_lastIndex = m_servers.GetUpperBound();
	return *pSrv;
}

void CLoginInfo::FillDefault()
{
	CLoginServer* pSrv = new CLoginServer();
	m_servers.Add(pSrv);
	//
	pSrv->m_databases.Add(L"database1");
	pSrv->m_databases.Add(L"database2");
	pSrv->m_lastDbIndex = 1;
	CLoginUser* pUser = new CLoginUser();
	pUser->m_authType = AUTH_SQL;
	pUser->m_login = L"login";
	pUser->m_password = L"password";
	pUser->m_bRemember = true;
	pSrv->m_users.Add(pUser);
	pSrv->m_name = L"localhost";
	pSrv->m_lastDbIndex = 0;
	pSrv->m_lastUserIndex = 0;
	//
	m_lastIndex = 0;
}
