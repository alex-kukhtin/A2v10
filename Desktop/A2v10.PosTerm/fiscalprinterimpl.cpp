// Copyright © 2015-2020 Alex Kukhtin. All rights reserved
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

FiscalPrinterImpl::FiscalPrinterImpl(void)
{
}

FiscalPrinterImpl::~FiscalPrinterImpl(void)
{
	if (IsOpen())
		Close();
}

// static 
ITraceTarget* FiscalPrinterImpl::_traceTarget = nullptr;

const wchar_t* FiscalPrinterImpl::GetLastError()
{
	return m_strError.c_str();
}

// virtual 
bool FiscalPrinterImpl::IsOpen() const
{
	return false;
}

// virtual 
void FiscalPrinterImpl::Init()
{
}

// virtual 
void FiscalPrinterImpl::Close()
{
}

// virtual 
bool FiscalPrinterImpl::IsReady() const
{
	return false;
}

// virtual 
bool FiscalPrinterImpl::IsEndOfTape()
{
	return false;
}

void FiscalPrinterImpl::PrintNonFiscalText(const wchar_t* szText)
{
}

// virtual 
void FiscalPrinterImpl::Beep()
{
}

// virtual 
bool FiscalPrinterImpl::ReportRems()
{
	return true;
}

// virtual 
bool FiscalPrinterImpl::CancelReceiptCommand(__int64 termId)
{
	return true;
}

// virtual 
bool FiscalPrinterImpl::PrintDiscount(long Type, long Sum, const wchar_t* szDescr)
{
	return true;
}

// virtual 
bool FiscalPrinterImpl::PrintDiscountForAllReceipt(long dscPercent, long dscSum)
{
	return true;
}

// virtual 
DWORD FiscalPrinterImpl::GetFlags()
{
	return 0;
}

const std::wstring& FiscalPrinterImpl::GetError() const
{
	throw CFPException(L"Yet not implemented");
}

// static 
void FiscalPrinterImpl::PosSetTraceTarget(ITraceTarget* target)
{
	_traceTarget = target;
}

bool FiscalPrinterImpl::IsDebugMode() const
{
	return true; // TODO!!!
}

void FiscalPrinterImpl::TraceINFO(const wchar_t* info, ...)
{
	va_list argList;
	va_start(argList, info);
	Trace(ITraceTarget::_info, info, argList);
	va_end(argList);
}

void FiscalPrinterImpl::TraceERROR(const wchar_t* info, ...)
{
	va_list argList;
	va_start(argList, info);
	Trace(ITraceTarget::_info, info, argList);
	va_end(argList);
}

// static 
void FiscalPrinterImpl::Trace(ITraceTarget::TraceType type, const wchar_t* info, va_list args)
{
	if (!_traceTarget)
		return;
	wchar_t buff[MAX_MSG_LEN];
	vswprintf(buff, MAX_MSG_LEN - 1, info, args);
	_traceTarget->Trace(type, buff);
}

