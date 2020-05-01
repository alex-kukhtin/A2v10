// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#pragma once

class FiscalPrinter;
class PosCommand;


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
	int _msgid;

	std::unique_ptr<JsonTarget> _data;

	PosCommand();
	void ExecuteCommand(std::wstring& result);
	void ExecuteConnectCommand(std::wstring& result);

protected:
	BEGIN_JSON_PROPS(3)
		STRING_PROP(id, _id)
		STRING_PROP(command, _command)
		INT_PROP(msgid, _msgid)
	END_JSON_PROPS()

	void ExecuteCommandInt(FiscalPrinter* pPrinter, std::wstring& result);

	virtual JsonTarget* CreateObject(const wchar_t* szName) override;

	void NullReceipt(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result);
	void XReport(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result);
	void ZReport(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result);
	void PrintReceipt(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result);
	void HasAcqTerminal(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result);
	void AcquirePayment(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result);
	void Connect(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result);
	void ServiceInOut(FiscalPrinter* pPrinter, JsonTarget* data, std::wstring& result);

	JsonTarget* NullReceiptData();
	JsonTarget* PrintReceiptData();
	JsonTarget* AcquirePaymentData();
	JsonTarget* ConnectData();
	JsonTarget* ServiceInOutData();

private:
	static COMMAND_BIND _binded_commands[];
};