// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#pragma once

class FiscalPrinter;

class PosConnectData : public JsonTarget
{
public:
	PosConnectData()
		: m_baud(0) {}
	std::wstring m_port;
	int m_baud;
protected:
	BEGIN_JSON_PROPS(2)
		STRING_PROP(port, m_port)
		INT_PROP(baud, m_baud)
	END_JSON_PROPS()
};

class PosCommand : public JsonTarget
{
	bool m_bConnected;
public: 
	std::wstring _command;
	std::wstring _id;

	std::unique_ptr<JsonTarget> _data;

	PosCommand();
	pos_result_t ExecuteCommand(std::wstring& result);

protected:
	BEGIN_JSON_PROPS(2)
		STRING_PROP(id, _id)
		STRING_PROP(command, _command)
	END_JSON_PROPS()

	pos_result_t  ConnectToPrinter();
	pos_result_t ExecuteCommandInt(FiscalPrinter* pPrinter);

	virtual JsonTarget* CreateObject(const wchar_t* szName) override;
};