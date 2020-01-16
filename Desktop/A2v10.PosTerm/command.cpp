// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "command.h"


PosCommand::PosCommand()
	: m_bConnected(false)
{
}

pos_result_t PosCommand::ExecuteCommand(std::wstring& result)
{
	result.clear();
	if (m_command == L"connect") {
		if (m_bConnected)
			return  pos_result_t::_already_connected;
		ConnectToPrinter();
	}
	else {
		if (!m_bConnected)
			return pos_result_t::_not_connected;
	}
	MessageBox(nullptr, m_command.c_str(), nullptr, MB_OK | MB_ICONASTERISK);
}

void PosCommand::ConnectToPrinter() 
{
	m_bConnected = true;
}
