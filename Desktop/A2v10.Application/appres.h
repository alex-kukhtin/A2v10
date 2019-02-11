#pragma once


class CApplicationResources
{
public:
	static bool LoadResource(const char* url, const char** mime, std::vector<byte>& data, std::vector<byte>& post, bool postMethod);
	static bool LoadStatic(const wchar_t* path, const char** pMime, std::vector<byte>& data);
};
