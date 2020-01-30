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

typedef void (PosCommand::*PFexecute)(FiscalPrinter*, JsonTarget*, std::wstring&);
typedef JsonTarget* (PosCommand::*PFCreateData)();

class PosCommand : public JsonTarget
{
	struct COMMAND_BIND {
		const wchar_t* _name;
		PFexecute _func;
		PFCreateData _createData;
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

	void NullReceipt(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result);
	void XReport(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result);
	void ZReport(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result);
	void PrintReceipt(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result);

	JsonTarget* NullReceiptData();
	JsonTarget* PrintReceiptData();

private:
	static COMMAND_BIND _binded_commands[];
};