#pragma once

enum pos_result_t {
	_success,
	_invalid_json,
	_not_connected,
	_already_connected
};

pos_result_t PosProcessCommand(const wchar_t* json, std::wstring& result);
