// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "framework.h"
#include "posterm.h"
#include "command.h"
#include "fiscalprinter.h"
#include "equipmentbase.h"
#include "fiscalprinterimpl.h"
#include "acqterminal.h"
#include "stringtools.h"
#include "errors.h"

#pragma comment(lib,"../Lib/A2v10.StaticBase.lib")

std::wstring _lastErrorMessage;
long _lastMsgId = -1;

void PosSetTraceTarget(ITraceTarget* target)
{
	EquipmentBaseImpl::SetTraceTarget(target);
}

bool PosConnectToPrinter(const PosConnectParams& prms)
{
	try {
		FiscalPrinter::Connect(prms);
		return true;
	}
	catch (EQUIPException ex) {
		_lastErrorMessage.assign(ex.GetError());
	}
	return false;
}

pos_result_t PosConnectToAcquiringTerminal(const wchar_t* model, const wchar_t* port, const wchar_t* log)
{
	return AcqTerminal::Connect(model, port, log);
}

void PosProcessCommandA(const char* json, std::string& result)
{
	std::wstring wjson = A2W(json, CP_UTF8);
	std::wstring wresult;
	PosProcessCommand(wjson.c_str(), wresult);
	result = W2A(wresult.c_str(), CP_UTF8);
}


void PosProcessCommand(const wchar_t* json, std::wstring& result)
{
	JsonParser parser;
	PosCommand cmd;
	const wchar_t* err;
	try 
	{
		parser.SetTarget(&cmd);
		parser.Parse(json);
		
		if (cmd._command == L"getStatus")
			_lastMsgId = -1;

		if (cmd._msgid == _lastMsgId) {
			result = L"{}";
			return; //
		}
		_lastMsgId = cmd._msgid;
		result = L"{\"msgid\":";
		result.append(std::to_wstring(cmd._msgid));
		std::wstring cmdresult;
		if (cmd._command == L"connect")
			cmdresult = cmd.ExecuteConnectCommand();
		else 
			cmdresult = cmd.ExecuteCommand();
		result.append(L", ");
		result.append(cmdresult.c_str());
		result.append(L", \"status\":\"success\"}");
		return;
	}
	catch (JsonException ex) 
	{
		err = L"JSON";
		_lastErrorMessage.assign(ex.GetMessage());
	}
	catch (EQUIPException ex) {
		err = L"EQ";
		_lastErrorMessage.assign(ex.GetError());
	}
	catch (...) {
		err = L"UNK";
		_lastErrorMessage.assign(L"Unknown exception");
	}
	EquipmentBaseImpl::TraceERROR(L"%s:%s", err, _lastErrorMessage.c_str());
	result.append(L", \"status\":\"error\",\"msg\":\"");
	result.append(_lastErrorMessage.c_str());
	result.append(L"\"}");
}

void PosShutDown()
{
	FiscalPrinter::ShutDown();
	AcqTerminal::ShutDown();
}

const wchar_t* PosLastErrorMessage()
{
	return _lastErrorMessage.c_str();
}

// TODO: убрать!
const wchar_t* PosErrorMessage(pos_result_t res)
{
	switch (res)
	{
	case _success:
		return nullptr;
	case _generic_error:
		return L"generic error";
	case _invalid_json:
		return L"invalid json";
	case _invalid_model:
		return L"invalid model";
	case _could_not_connect:
		return L"could not connect";
	case _already_connected:
		return L"already connected";
	case _device_not_found:
		return L"device not found";
	case _device_error:
		return L"device error";
	}
	return L"unknown error";
}
