// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "framework.h"
#include "fiscalprinterimpl.h"

bool CFiscalPrinterImpl::PrintNonFiscalText(const wchar_t* szText)
{
	return true;
}

// virtual 
bool CFiscalPrinterImpl::Beep()
{
	return true;
}
