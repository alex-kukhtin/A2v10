
#include "pch.h"
#include "strings.h"

std::vector<std::string> _split(const std::string& str, char delim /*= ' '*/)
{
	std::vector<std::string> result;
	std::size_t current, previous = 0;
	current = str.find(delim);
	while (current != std::string::npos) {
		result.push_back(str.substr(previous, current - previous));
		previous = current + 1;
		current = str.find(delim, previous);
	}
	result.push_back(str.substr(previous, current - previous));
	return result;
}

std::vector<std::wstring> _wsplit(const std::wstring& str, wchar_t delim /*= L' '*/)
{
	std::vector<std::wstring> result;
	std::size_t current, previous = 0;
	current = str.find(delim);
	while (current != std::wstring::npos) {
		result.push_back(str.substr(previous, current - previous));
		previous = current + 1;
		current = str.find(delim, previous);
	}
	result.push_back(str.substr(previous, current - previous));
	return result;
}
