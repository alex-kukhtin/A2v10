#pragma once

std::wstring A2W(const char* source, UINT acp = CP_THREAD_ACP);
std::string W2A(const wchar_t* source, UINT acp = CP_THREAD_ACP);

