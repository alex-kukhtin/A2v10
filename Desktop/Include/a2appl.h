#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CA2CommandLineInfo : public CCommandLineInfo
{
	bool m_bDebug;
public:
	CA2CommandLineInfo()
		: m_bDebug(false) {}
	virtual void ParseParam(const TCHAR* pszParam, BOOL bFlag, BOOL bLast);
	bool IsDebugMode() const
		{ return m_bDebug; }
};

#undef AFX_DATA
#define AFX_DATA

