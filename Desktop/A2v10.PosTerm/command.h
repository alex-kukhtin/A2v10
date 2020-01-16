// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#pragma once

class PosCommand : public JsonTarget
{
	bool m_bConnected;
public: 
	std::wstring m_command;

	PosCommand();
	pos_result_t ExecuteCommand(std::wstring& result);

protected:
	BEGIN_JSON_PROPS(1)
		STRING_PROP(command, m_command)
	END_JSON_PROPS()

	void ConnectToPrinter();
};