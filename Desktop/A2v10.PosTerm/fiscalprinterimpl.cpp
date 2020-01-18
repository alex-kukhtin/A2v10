// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "fiscalprinterimpl.h"


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
ITraceTarget* CFiscalPrinterImpl::_traceTarget = nullptr;

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
void CFiscalPrinterImpl::PosSetTraceTarget(ITraceTarget* target)
{
	_traceTarget = target;
}

bool CFiscalPrinterImpl::IsDebugMode() const
{
	return true; // TODO!!!
}

void CFiscalPrinterImpl::TraceINFO(const wchar_t* info, ...)
{
	va_list argList;
	va_start(argList, info);
	Trace(ITraceTarget::_info, info, argList);
	va_end(argList);
}

void CFiscalPrinterImpl::TraceERROR(const wchar_t* info, ...)
{
	va_list argList;
	va_start(argList, info);
	Trace(ITraceTarget::_info, info, argList);
	va_end(argList);
}

// static 
void CFiscalPrinterImpl::Trace(ITraceTarget::TraceType type, const wchar_t* info, va_list args)
{
	if (!_traceTarget)
		return;
	wchar_t buff[MAX_MSG_LEN];
	vswprintf(buff, MAX_MSG_LEN - 1, info, args);
	_traceTarget->Trace(type, buff);
}

