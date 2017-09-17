#pragma once


class CApplicationResources
{
public:
	static bool LoadResource(const char* url, LPCSTR* mime, std::vector<byte>& data, const char* postData);
};
