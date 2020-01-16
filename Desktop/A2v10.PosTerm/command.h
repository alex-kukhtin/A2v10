// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#pragma once

class FiscalPrinter;

class PosCommand : public JsonTarget
{
	bool m_bConnected;
public: 
	std::wstring m_command;
	std::wstring m_id;

	PosCommand();
	pos_result_t ExecuteCommand(std::wstring& result);

protected:
	BEGIN_JSON_PROPS(2)
		STRING_PROP(id, m_id)
		STRING_PROP(command, m_command)
	END_JSON_PROPS()

	pos_result_t  ConnectToPrinter();
	pos_result_t ExecuteCommandInt(FiscalPrinter* pPrinter);
};