
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

const wchar_t* bool2string(bool v)
{
	return v ? L"true" : L"false";
}


_locale_t _enLocale = nullptr;
_locale_t _uaLocale = nullptr;

_locale_t _getLocaleUS() {
	if (_enLocale == nullptr)
		_enLocale = _create_locale(LC_ALL, "en-US");
	return _enLocale;
}

_locale_t _getLocaleUA() {
	if (_uaLocale == nullptr)
		_uaLocale = _create_locale(LC_ALL, "uk-UA");
	return _uaLocale;
}
