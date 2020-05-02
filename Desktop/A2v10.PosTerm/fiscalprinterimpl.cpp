// Copyright © 2015-2020 Alex Kukhtin. All rights reserved

#include "pch.h"
#include "posterm.h"
#include "equipmentbase.h"
#include "fiscalprinter.h"
#include "fiscalprinterimpl.h"



FiscalPrinterImpl::FiscalPrinterImpl(void)
{
}

FiscalPrinterImpl::~FiscalPrinterImpl(void)
{
	if (IsOpen())
		Close();
}

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
	throw EQUIPException(L"Yet not implemented");
}


bool FiscalPrinterImpl::IsDebugMode() const
{
	return true; // TODO!!!
}
