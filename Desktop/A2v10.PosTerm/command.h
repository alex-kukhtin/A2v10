// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#pragma once

class FiscalPrinter;
class PosCommand;

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

class PosNullReceiptData : public JsonTarget
{
public:
	PosNullReceiptData()
		: m_openCashDrawer(false) {}
	bool m_openCashDrawer;
protected:
	BEGIN_JSON_PROPS(1)
		BOOL_PROP(openCashDrawer, m_openCashDrawer)
	END_JSON_PROPS()
};

typedef bool (PosCommand::*PFexecute)(FiscalPrinter*, JsonTarget*, std::wstring&);


class PosCommand : public JsonTarget
{
	struct COMMAND_BIND {
		const wchar_t* _name;
		PFexecute _func;
	};
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

	pos_result_t ExecuteCommandInt(FiscalPrinter* pPrinter, std::wstring& result);

	virtual JsonTarget* CreateObject(const wchar_t* szName) override;

	bool NullReceipt(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result);
	bool XReport(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result);
	bool ZReport(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result);
private:
	static COMMAND_BIND _binded_commands[];
};