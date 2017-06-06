

#include "stdafx.h"

#include "../include/appdefs.h"
#include "../include/appdata.h"
#include "../include/a2appl.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

// virtual 
void CA2CommandLineInfo::ParseParam(const TCHAR* pszParam, BOOL bFlag, BOOL bLast)
{
	CString strParam(pszParam);
	if (bFlag && (strParam.CompareNoCase(L"DEBUG") == 0))
	{
		m_bDebug = true;
		return;
	}
	__super::ParseParam(pszParam, bFlag, bLast);
}


