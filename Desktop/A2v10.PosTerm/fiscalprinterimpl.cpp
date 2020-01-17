// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "framework.h"
#include "fiscalprinterimpl.h"


#define WM_APP_A2 (WM_APP + 80)
#define WMI_POS_TRACE (WM_APP_A2 + 15) // see: appdefs.h
#define WMI_POS_TRACE_WPARAM_FIRST 11
#define WMI_POS_TRACE_WPARAM_INFO  11
#define WMI_POS_TRACE_WPARAM_ERROR 12
#define WMI_POS_TRACE_WPARAM_LAST  12

#define MAX_MSG_LEN 1024

const wchar_t* CFPException::GetError()
{
	return _error.c_str();
}

/*
void CFPException::ReportError2()
{
	if (m_nID != 0) {
		CString s;
		s.LoadString(m_nID);
		AfxMessageBox(s, MB_ICONSTOP);
	}
	else {
		AfxMessageBox(m_strError, MB_ICONSTOP);
	}
	::MessageBox(nullptr, _error.c_str(), nullptr, MB_OK | MB_ICONHAND);
}
*/

CFiscalPrinterImpl::CFiscalPrinterImpl(void)
{
}

CFiscalPrinterImpl::~CFiscalPrinterImpl(void)
{
	if (IsOpen())
		Close();
}

// static 
HWND CFiscalPrinterImpl::_hostHwnd = nullptr;

const wchar_t* CFiscalPrinterImpl::GetLastError()
{
	return m_strError.c_str();
}

// virtual 
bool CFiscalPrinterImpl::IsOpen() const
{
	return false;
}

// virtual 
bool CFiscalPrinterImpl::Init(__int64 termId)
{
	return true;
}

// virtual 
void CFiscalPrinterImpl::Close()
{
}

// virtual 
bool CFiscalPrinterImpl::IsReady() const
{
	return false;
}

// virtual 
bool CFiscalPrinterImpl::IsEndOfTape()
{
	return false;
}

bool CFiscalPrinterImpl::PrintNonFiscalText(const wchar_t* szText)
{
	return true;
}

// virtual 
bool CFiscalPrinterImpl::Beep()
{
	return true;
}

// virtual 
bool CFiscalPrinterImpl::ReportRems()
{
	return true;
}

// virtual 
bool CFiscalPrinterImpl::CancelReceiptCommand(__int64 termId)
{
	return true;
}

// virtual 
bool CFiscalPrinterImpl::PrintDiscount(long Type, long Sum, const wchar_t* szDescr)
{
	return true;
}

// virtual 
bool CFiscalPrinterImpl::PrintDiscountForAllReceipt(long dscPercent, long dscSum)
{
	return true;
}

// virtual 
DWORD CFiscalPrinterImpl::GetFlags()
{
	return 0;
}

const std::wstring& CFiscalPrinterImpl::GetError() const
{
	throw CFPException(L"Yet not implemented");
}

// static 
void CFiscalPrinterImpl::SetHostHandle(HWND hHandle)
{
	_hostHwnd = hHandle;
}

bool CFiscalPrinterImpl::IsDebugMode() const
{
	return true; // TODO!!!
}


void CFiscalPrinterImpl::TraceINFO(const wchar_t* info, ...)
{
	va_list argList;
	va_start(argList, info);
	Trace(WMI_POS_TRACE_WPARAM_INFO, info, argList);
	va_end(argList);
}

void CFiscalPrinterImpl::TraceERROR(const wchar_t* info, ...)
{
	va_list argList;
	va_start(argList, info);
	Trace(WMI_POS_TRACE_WPARAM_ERROR, info, argList);
	va_end(argList);
}

// static 
void CFiscalPrinterImpl::Trace(int type, const wchar_t* info, va_list args)
{
	if (!_hostHwnd)
		return;
	wchar_t buff[MAX_MSG_LEN];
	vswprintf(buff, MAX_MSG_LEN - 1, info, args);
	::SendMessage(_hostHwnd, WMI_POS_TRACE, (WPARAM)type, (LPARAM)buff);
}

