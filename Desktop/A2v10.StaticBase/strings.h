#pragma once

std::vector<std::string> _split(const std::string& str, char delim = ' ');
std::vector<std::wstring> _wsplit(const std::wstring& str, wchar_t delim = L' ');

const wchar_t* bool2string(bool v);

_locale_t _getLocaleUS();
_locale_t _getLocaleUA();
