// Copyright © 2020 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "appconfig.h"

#define PROP_LENGTH 64
#define DEFAULT_BAUD 9600

CAppConfigFiscalPrinter::CAppConfigFiscalPrinter()
	:m_baud(DEFAULT_BAUD)
{

}

bool CAppConfig::NeedBackgroundThread() 
{
	return HasFiscalPrinters() || HasAcqTerminals();
}

bool CAppConfig::ConnectToPrinter()
{
	if (!HasFiscalPrinters())
		return true;
	CAppConfigFiscalPrinter* pPrinter = m_fiscalPrinters.begin()->get();
	pos_result_t rc = PosConnectToPrinter(pPrinter->m_model.c_str(), pPrinter->m_port.c_str(), pPrinter->m_baud);
	if (rc == pos_result_t::_success)
		return true;
	CString msg;
	msg.Format(L"Could not connect to fiscal printer.\n{\n  model:'%s',\n  port:'%s',\n  baud:%d,\n  error:'%s'\n}", 
		pPrinter->m_model.c_str(), pPrinter->m_port.c_str(), pPrinter->m_baud, PosErrorMessage(rc));
	AfxMessageBox(msg);
	return false;
}

bool CAppConfig::ConnectToAcquiringTerminal() {
	if (!HasAcqTerminals())
		return true;
	for (auto it = m_acqTerminals.begin(); it != m_acqTerminals.end(); it++) {
		CAppConfigAcqTerminal* pTerminal = it->get();
		pos_result_t rc = PosConnectToAcquiringTerminal(pTerminal->_model.c_str(), pTerminal->_port.c_str(), pTerminal->_log.c_str());
		if (rc == pos_result_t::_success)
			continue;
		CString msg;
		msg.Format(L"Could not connect to acquiring terminal.\n{\n  model:'%s',\n  port:'%s',\n  error:'%s'\n}",
			pTerminal->_model.c_str(), pTerminal ->_port.c_str(), PosErrorMessage(rc));
		AfxMessageBox(msg);
		return false;
	}
	return true;
}

void CAppConfig::ShutDown()
{
	PosShutDown();
}