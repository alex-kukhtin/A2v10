// Copyright © 2020 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "appconfig.h"

#define PROP_LENGTH 64
#define DEFAULT_BAUD 9600

CAppConfigFiscalPrinter::CAppConfigFiscalPrinter()
	:m_baud(DEFAULT_BAUD)
{

}

bool CAppConfig::ConnectToPrinter()
{
	if (!HasFiscalPrinters())
		return false;
	CAppConfigFiscalPrinter* pPrinter = m_fiscalPrinters.ElementAt(0);
	pos_result_t rc = PosConnectToPrinter(pPrinter->m_model.c_str(), pPrinter->m_port.c_str(), pPrinter->m_baud);
	if (rc == pos_result_t::_success)
		return true;
	AfxMessageBox(L"Unable to connect to fiscal printer");
	return false;
}

void CAppConfig::ShutDown()
{
	PosShutDown();
}