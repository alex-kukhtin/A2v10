// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "framework.h"
#include "fiscalprinterimpl.h"


void CFPException::ReportError2()
{
	/*
	if (m_nID != 0) {
		CString s;
		s.LoadString(m_nID);
		AfxMessageBox(s, MB_ICONSTOP);
	}
	else {
		AfxMessageBox(m_strError, MB_ICONSTOP);
	}
	*/
	::MessageBox(nullptr, m_strError.c_str(), nullptr, MB_OK | MB_ICONHAND);
}

CFiscalPrinterImpl::CFiscalPrinterImpl(void)
{
}

CFiscalPrinterImpl::~CFiscalPrinterImpl(void)
{
	if (IsOpen())
		Close();
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
bool CFiscalPrinterImpl::CancelReceiptCommand(__int64 termId)
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
