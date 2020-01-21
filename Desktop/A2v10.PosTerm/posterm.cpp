
#include "pch.h"
#include "framework.h"
#include "posterm.h"
#include "command.h"
#include "fiscalprinter.h"
#include "fiscalprinterimpl.h"

#pragma comment(lib,"../Lib/A2v10.StaticBase.lib")


void PosSetTraceTarget(ITraceTarget* target)
{
	FiscalPrinterImpl::PosSetTraceTarget(target);
}

pos_result_t PosConnectToPrinter(const wchar_t* model, const wchar_t* port, int baud)
{
	return FiscalPrinter::Connect(model, port, baud);
}

pos_result_t PosProcessCommand(const wchar_t* json, std::wstring& result)
{
	JsonParser parser;
	PosCommand cmd;
	try 
	{
		parser.SetTarget(&cmd);
		parser.Parse(json);
		return cmd.ExecuteCommand(result);
	}
	catch (JsonException ex) {
		result.assign(ex.GetMessage());
		return pos_result_t::_invalid_json;
	}
	catch (...) {
		result.assign(L"Unknown exception");
		return pos_result_t::_invalid_json;
	}
	return pos_result_t::_success;
}

void PosShutDown()
{
	FiscalPrinter::ShutDown();
}
