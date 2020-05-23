// Copyright © 2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "stringtools.h"

#define MAX_FMT_LEN 1024

std::wstring A2W(const char* source, UINT acp /*= CP_THREAD_ACP*/) {
	std::wstring result;
	int need = MultiByteToWideChar(acp, 0, source, -1, nullptr, 0);
	need -= 1; // null-terminated!
	result.resize(need);
	MultiByteToWideChar(acp, 0, source, -1, &result[0], need);
	return result;
}

std::string W2A(const wchar_t* source, UINT acp /*= CP_THREAD_ACP*/) {
	std::string result;
	int need = WideCharToMultiByte(acp, 0, source, -1, nullptr, 0, nullptr, nullptr);
	need -= 1; // null-terminated!
	result.resize(need);
	WideCharToMultiByte(acp, 0, source, -1, &result[0], need, nullptr, nullptr);
	return result;
}

std::string Format(const char* fmt, ...)
{
	va_list argList;
	va_start(argList, fmt);
	char buff[MAX_FMT_LEN];
	vsprintf_s(buff, MAX_FMT_LEN - 1, fmt, argList);
	va_end(argList);
	return buff;
}

std::wstring Format(const wchar_t* fmt, ...)
{
	va_list argList;
	va_start(argList, fmt);
	wchar_t buff[MAX_FMT_LEN];
	vswprintf(buff, MAX_FMT_LEN - 1, fmt, argList);
	va_end(argList);
	return buff;
}


