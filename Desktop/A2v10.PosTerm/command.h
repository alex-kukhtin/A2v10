// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#pragma once

class FiscalPrinter;
class PosCommand;


typedef std::wstring (PosCommand::*PFexecute)(FiscalPrinter*, JsonTarget*);
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
	std::wstring ExecuteCommand();
	std::wstring ExecuteConnectCommand();

protected:
	BEGIN_JSON_PROPS(3)
		STRING_PROP(id, _id)
		STRING_PROP(command, _command)
		INT_PROP(msgid, _msgid)
	END_JSON_PROPS()

	std::wstring ExecuteCommandInt(FiscalPrinter* pPrinter);

	virtual JsonTarget* CreateObject(const wchar_t* szName) override;

	std::wstring NullReceipt(FiscalPrinter* pPrinter, JsonTarget* data);
	std::wstring XReport(FiscalPrinter* pPrinter, JsonTarget* data);
	std::wstring ZReport(FiscalPrinter* pPrinter, JsonTarget* data);
	std::wstring PrintReceipt(FiscalPrinter* pPrinter, JsonTarget* data);
	std::wstring PrintReturnReceipt(FiscalPrinter* pPrinter, JsonTarget* data);
	std::wstring HasAcqTerminal(FiscalPrinter* pPrinter, JsonTarget* data);
	std::wstring AcquirePayment(FiscalPrinter* pPrinter, JsonTarget* data);
	std::wstring Connect(FiscalPrinter* pPrinter, JsonTarget* data);
	std::wstring ServiceInOut(FiscalPrinter* pPrinter, JsonTarget* data);
	std::wstring PeriodReport(FiscalPrinter* pPrinter, JsonTarget* data);
	std::wstring ZReportInfo(FiscalPrinter* pPrinter, JsonTarget* data);

	JsonTarget* NullReceiptData();
	JsonTarget* PrintReceiptData();
	JsonTarget* AcquirePaymentData();
	JsonTarget* ConnectData();
	JsonTarget* ServiceInOutData();
	JsonTarget* PeriodReportData();

private:
	static COMMAND_BIND _binded_commands[];
};