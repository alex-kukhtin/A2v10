#pragma once

enum pos_result_t {
	_success,
	_error,
	_invalid_json,
	_invalid_model,
	_not_connected,
	_already_connected,
	_printer_not_found
};


class ITraceTarget abstract {

public:
	enum TraceType {
		_info,
		_error
	};
	virtual void Trace(TraceType type, const wchar_t* message) = 0;
};

pos_result_t PosProcessCommand(const wchar_t* json, std::wstring& result);
pos_result_t PosConnectToPrinter(const wchar_t* model, const wchar_t* port, int baud);

void PosSetTraceTarget(ITraceTarget* target);
