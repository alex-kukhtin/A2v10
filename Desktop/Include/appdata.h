#pragma once


#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CAppData
{
	CAppData(void); // declaration only
	~CAppData(void);
public:
	static void SetDebug(bool bDebug = true);
	static bool IsDebug();

	static void Trace(TRACE_TYPE tt, TRACE_CATEGORY tc, LPCWSTR szFile, LPCWSTR szMsg, va_list args);

	static void TraceINFO(TRACE_CATEGORY tc, LPCWSTR szFile, LPCWSTR szMsg, ...);
	static void TraceWARNING(TRACE_CATEGORY tc, LPCWSTR szFile, LPCWSTR szMsg, ...);
	static void TraceERROR(TRACE_CATEGORY tc, LPCWSTR szFile, LPCWSTR szMsg, ...);
	static void ClearTrace();
};