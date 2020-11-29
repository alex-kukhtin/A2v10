// Copyright © 2020 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "appconfig.h"
#include "posterm.h"
#include "A2v10.Application.h"

#define PROP_LENGTH 64
#define DEFAULT_BAUD 9600
#define DEFAULT_LINELEN 32

CAppConfigFiscalPrinter::CAppConfigFiscalPrinter()
	:_baud(DEFAULT_BAUD), _lineLen(DEFAULT_LINELEN)
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
	// first printer only ???
	CAppConfigFiscalPrinter* pPrinter = m_fiscalPrinters.begin()->get();
	PosConnectParams prms;
	prms.model = pPrinter->_model.c_str();
	prms.port = pPrinter->_port.c_str();
	prms.baud = pPrinter->_baud;
	prms.printerName = pPrinter->_printerName.c_str();
	prms.lineLen = pPrinter->_lineLen;
	theApp._terminalCode = pPrinter->_terminal.c_str();

	if (pPrinter->_terminal.empty()) {
		AfxMessageBox(L"'terminal' value not specified in configuration file");
		return false;
	}

	bool rc = PosConnectToPrinter(prms);
	if (!rc) {
		CString msg;
		if (!pPrinter->_printerName.empty())
			msg.Format(L"Could not connect to fiscal printer.\n{\n  model:'%s',\n  printerName:'%s',\n  lineLen:%d,\n  error:'%s'\n}",
				pPrinter->_model.c_str(), pPrinter->_printerName.c_str(), pPrinter->_lineLen, PosLastErrorMessage());
		else
			msg.Format(L"Could not connect to fiscal printer.\n{\n  model:'%s',\n  port:'%s',\n  baud:%d,\n  error:'%s'\n}",
				pPrinter->_model.c_str(), pPrinter->_port.c_str(), pPrinter->_baud, PosLastErrorMessage());
		AfxMessageBox(msg);
		return false;
	}
	return true;
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