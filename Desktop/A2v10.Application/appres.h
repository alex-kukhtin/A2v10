#pragma once


class CApplicationResources
{
public:
	static bool LoadResource(const char* url, const char** mime, std::vector<byte>& data, const char* postData);
};
