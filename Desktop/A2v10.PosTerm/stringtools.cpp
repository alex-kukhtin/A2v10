// Copyright © 2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "stringtools.h"


std::wstring A2W(const char* source) {
	UINT acp = CP_THREAD_ACP;
	std::wstring result;
	int need = MultiByteToWideChar(acp, 0, source, -1, nullptr, 0);
	result.resize(need);
	MultiByteToWideChar(acp, 0, source, -1, &result[0], need);
	return result;
}

std::string W2A(const wchar_t* source) {
	UINT acp = CP_THREAD_ACP;
	std::string result;
	int need = WideCharToMultiByte(acp, 0, source, -1, nullptr, 0, nullptr, nullptr);
	result.resize(need);
	WideCharToMultiByte(acp, 0, source, -1, &result[0], need, nullptr, nullptr);
	return result;
}

