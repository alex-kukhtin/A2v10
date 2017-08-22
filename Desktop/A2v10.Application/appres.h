#pragma once


class CApplicationResources
{
public:
	static const byte* LoadResource(LPCSTR url, LPCSTR* mime, int& resSize);
};
