
#include "stdafx.h"

#include "../include/appdefs.h"
#include "../include/appdata.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


struct TBSTRUCT
{
	TRACE_TYPE			tt;
	TRACE_CATEGORY	tc;
	CString	strText;
	CString strFile;
	COleDateTime time;
};


struct APP_DATA
{
	APP_DATA();
	~APP_DATA();
	bool m_bDebug;
	bool m_bFullScreen;
	CArray<TBSTRUCT> m_traceBuffer;
};

APP_DATA::APP_DATA()
	: m_bDebug(false), m_bFullScreen(false)
{
}

APP_DATA::~APP_DATA()
{
}

static APP_DATA& getAppData()
{
	static APP_DATA app_data;
	return app_data;
}

// static 
void CAppData::SetDebug(bool bDebug /*= true*/)
{
	getAppData().m_bDebug = bDebug;
	if (!bDebug)
		getAppData().m_traceBuffer.RemoveAll();
}

// static 
bool CAppData::IsDebug()
{
	return getAppData().m_bDebug;
}

static void __unload_trace_buffer(CWnd* pWnd)
{
	ATLASSERT(pWnd && pWnd->GetSafeHwnd());
	TRACE_INFO ti;
	for (int i = 0; i<getAppData().m_traceBuffer.GetSize(); i++) {
		TBSTRUCT& tbs = getAppData().m_traceBuffer.ElementAt(i);
		ti.tc = tbs.tc;
		ti.tt = tbs.tt;
		ti.szFile = tbs.strFile;
		ti.szText = tbs.strText;
		ti.time = tbs.time;
		pWnd->SendMessage(WMIC_DEBUG_MSG, WMIC_DEBUG_MSG_WPARAM, (LPARAM)(&ti));
	}
	getAppData().m_traceBuffer.RemoveAll();
}

struct STATIC_TRACE
{
	static TRACE_TYPE s_tt;
	static TRACE_CATEGORY s_tc;
	static CString strFile;
	static CString strMsg;
} _s_t;

TRACE_TYPE STATIC_TRACE::s_tt = TRACE_TYPE_UNKNOWN;
TRACE_CATEGORY STATIC_TRACE::s_tc = TRACE_CAT_UNK;
CString STATIC_TRACE::strFile = EMPTYSTR;
CString STATIC_TRACE::strMsg = EMPTYSTR;

// static 
void CAppData::Trace(TRACE_TYPE tt, TRACE_CATEGORY tc, LPCWSTR szFile, LPCWSTR szMsg, va_list args)
{
	if (!CAppData::IsDebug())
		return;
	CString s;
	s.FormatV(szMsg, args);
	{
		// Защита от одинаковых сообщений
		if ((tt == _s_t.s_tt) && (tc == _s_t.s_tc) && (_s_t.strFile == CString(szFile)) && (_s_t.strMsg == s))
			return;
		_s_t.s_tt = tt;
		_s_t.s_tc = tc;
		_s_t.strFile = szFile;
		_s_t.strMsg = s;
	}
	s.Replace(L'\n', L' ');
	CWnd* pWnd = AfxGetApp()->GetMainWnd();
	if (pWnd == nullptr) {
		getAppData().m_traceBuffer.SetSize(getAppData().m_traceBuffer.GetSize() + 1);
		TBSTRUCT& tbs = getAppData().m_traceBuffer.ElementAt(getAppData().m_traceBuffer.GetUpperBound());
		tbs.tt = tt;
		tbs.tc = tc;
		tbs.strFile = szFile;
		tbs.strText = s;
		tbs.time = COleDateTime::GetCurrentTime();
		return;
	}
	else {
		if (!getAppData().m_traceBuffer.IsEmpty()) {
			__unload_trace_buffer(pWnd);
		}
	}
	TRACE_INFO ti;
	ti.tc = tc;
	ti.tt = tt;
	ti.szText = (LPCWSTR)s;
	ti.szFile = szFile;
	ti.time = COleDateTime::GetCurrentTime();
	pWnd->SendMessage(WMIC_DEBUG_MSG, WMIC_DEBUG_MSG_WPARAM, (LPARAM)(&ti));
}

// static 
void CAppData::TraceINFO(TRACE_CATEGORY tc, LPCWSTR szFile, LPCWSTR szMsg, ...)
{
	if (!CAppData::IsDebug())
		return;
	va_list ptr;
	va_start(ptr, szMsg);
	Trace(TRACE_TYPE_INFO, tc, szFile, szMsg, ptr);
	va_end(ptr);
}

// static 
void CAppData::TraceWARNING(TRACE_CATEGORY tc, LPCWSTR szFile, LPCWSTR szMsg, ...)
{
	if (!CAppData::IsDebug())
		return;
	va_list argList;
	va_start(argList, szMsg);
	Trace(TRACE_TYPE_WARNING, tc, szFile, szMsg, argList);
	va_end(argList);
}

// static 
void CAppData::TraceERROR(TRACE_CATEGORY tc, LPCWSTR szFile, LPCWSTR szMsg, ...)
{
	if (!CAppData::IsDebug())
		return;
	va_list argList;
	va_start(argList, szMsg);
	Trace(TRACE_TYPE_ERROR, tc, szFile, szMsg, argList);
	va_end(argList);
}

// static
void CAppData::ClearTrace()
{
	_s_t.s_tt = TRACE_TYPE_UNKNOWN;
	_s_t.s_tc = TRACE_CAT_UNK;
	_s_t.strFile = EMPTYSTR;
	_s_t.strMsg = EMPTYSTR;
}
