// Copyright © 2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "A2v10.Application.h"
#include "logininfo.h"

IMPLEMENT_SERIAL(CLoginUser, CObject, 1)
IMPLEMENT_SERIAL(CLoginServer, CObject, 1)
IMPLEMENT_SERIAL(CLoginInfo, CObject, 1)

CLoginUser& CLoginUser::operator=(const CLoginUser& user)
{
	m_login = user.m_login;
	m_password = user.m_password;
	m_authType = user.m_authType;
	m_bRemember = user.m_bRemember;
	return *this;
}

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

void CLoginServer::Serialize(CArchive & ar)
{
	if (ar.IsStoring()) 
	{
		ar << m_name;
	} 
	else 
	{
		ar >> m_name;
	}
	m_users.Serialize(ar);
	m_databases.Serialize(ar);
}

CLoginServer& CLoginServer::operator=(const CLoginServer& server)
{
	m_name = server.m_name;
	m_users.Copy(server.m_users);
	m_databases.Copy(server.m_databases);
	return *this;
}


////////////////
// CLoginInfo

void CLoginInfo::Serialize(CArchive & ar)
{
	if (ar.IsStoring())
		ar << m_lastIndex;
	else
		ar >> m_lastIndex;
	m_servers.Serialize(ar);

	CLoginServer srv;
	m_servers.Add(srv);
}

