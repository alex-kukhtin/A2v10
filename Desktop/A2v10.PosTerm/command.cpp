// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "command.h"
#include "fiscalprinter.h"


const wchar_t* CMD_NULL_RECEIPT = L"nullReceipt";
const size_t CMD_MAX_LEN = 64;


//static 
PosCommand::COMMAND_BIND PosCommand::_binded_commands[] = 
{
	{L"nullReceipt", &PosCommand::NullReceipt},
	{L"xReport",     &PosCommand::XReport},
	{L"zReport",     &PosCommand::ZReport},
	{nullptr, nullptr}
};

PosCommand::PosCommand()
{
}

pos_result_t PosCommand::ExecuteCommand(std::wstring& result)
{
	result.clear();
	FiscalPrinter* pPrinter = FiscalPrinter::FindPrinter(_id.c_str());
	if (pPrinter == nullptr)
		return pos_result_t::_printer_not_found;
	return ExecuteCommandInt(pPrinter, result);
}

pos_result_t PosCommand::ExecuteCommandInt(FiscalPrinter* pPrinter, std::wstring& result)
{
	PosCommand::COMMAND_BIND* entry = _binded_commands;
	while (entry && entry->_name) {
		if (_command == entry->_name) {
			auto func = entry->_func;
			bool rc = (this->*entry->_func)(pPrinter, _data.get(), result);
			if (rc)
				return pos_result_t::_success;
			else {
				result = pPrinter->GetLastError();
				return pos_result_t::_error;
			}
		}
		entry++;
	}
	return pos_result_t::_success;
}

// virtual 
JsonTarget* PosCommand::CreateObject(const wchar_t* szName) 
{
	if (wcsncmp(szName, L"data", CMD_MAX_LEN) == 0) {
		if (wcsncmp(_command.c_str(), CMD_NULL_RECEIPT, CMD_MAX_LEN) == 0)
			_data.reset(new PosNullReceiptData());
	}
	return _data.get();
}

bool PosCommand::NullReceipt(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result)
{
	PosNullReceiptData* pnrd = dynamic_cast<PosNullReceiptData*>(data);
	bool bOpenDrawer = false;
	if (pnrd)
		bOpenDrawer = pnrd->m_openCashDrawer;
	return pPrinter->NullReceipt(bOpenDrawer);
}

bool PosCommand::XReport(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result)
{
	return pPrinter->XReport();
}

bool PosCommand::ZReport(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result)
{
	return pPrinter->ZReport();
}
