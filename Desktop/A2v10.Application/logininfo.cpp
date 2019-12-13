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
	}
	else 
	{
		ar >> m_login;
		ar >> m_authType;
		ar >> m_password;
	}
}

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

void CLoginInfo::Serialize(CArchive & ar)
{
	if (ar.IsStoring())
		ar << m_lastIndex;
	else
		ar >> m_lastIndex;
	m_servers.Serialize(ar);
}

