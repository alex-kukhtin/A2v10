#pragma once

enum pos_result_t {
	_success,
	_generic_error,
	_invalid_json,
	_invalid_model,
	_could_not_connect,
	_already_connected,
	_device_not_found,
	_device_error,
	_not_connected
};

struct PosConnectParams
{
	const wchar_t* id;
	const wchar_t* model;
	const wchar_t* port;
	int baud;
	const wchar_t* payModes;
	const wchar_t* taxModes;
};

struct PosResult {
	pos_result_t result;
	std::wstring retvalue;
	std::wstring message;
};

class ITraceTarget abstract {

public:
	enum TraceType {
		_info,
		_error
	};
	virtual void Trace(TraceType type, const wchar_t* message) = 0;
};

void PosProcessCommand(const wchar_t* json, std::wstring& result);

bool PosConnectToPrinter(const PosConnectParams& prms);

void PosProcessCommandA(const char* json, std::string& result);


pos_result_t PosConnectToAcquiringTerminal(const wchar_t* model, const wchar_t* port, const wchar_t* log);

void PosShutDown();

const wchar_t* PosErrorMessage(pos_result_t res);
const wchar_t* PosLastErrorMessage();

void PosSetTraceTarget(ITraceTarget* target);
