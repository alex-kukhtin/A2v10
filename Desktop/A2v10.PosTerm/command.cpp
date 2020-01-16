// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "command.h"
#include "fiscalprinter.h"


const wchar_t* CMD_CONNECT = L"connect";
const wchar_t* CMD_NULL = L"null";
const wchar_t* CMD_OPEN_FISCAL = L"openFiscal";

PosCommand::PosCommand()
	: m_bConnected(false)
{
}

pos_result_t PosCommand::ExecuteCommand(std::wstring& result)
{
	result.clear();
	if (m_command == CMD_CONNECT) {
		if (m_bConnected)
			return  pos_result_t::_already_connected;
		return ConnectToPrinter();
	}
	else 
	{
		if (!m_bConnected)
			return pos_result_t::_not_connected;
		FiscalPrinter* pPrinter = FiscalPrinter::FindPrinter(m_id.c_str());
		if (pPrinter == nullptr)
			return pos_result_t::_printer_not_found;
		return ExecuteCommandInt(pPrinter);
	}
}

pos_result_t PosCommand::ConnectToPrinter()
{
	m_bConnected = true;
	return pos_result_t::_success;
}

pos_result_t PosCommand::ExecuteCommandInt(FiscalPrinter* pPrinter)
{
	return pos_result_t::_success;
}

