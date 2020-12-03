
// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "stringtools.h"
#include "escpos_printer.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#define DEFAULT_LINELEN 32

EscPos_Printer::EscPos_Printer(const wchar_t* printerName, int lineLength)
{
	_printerName = printerName;
	_lineLength = lineLength;
}

// static 
int EscPos_Printer::DefaultLineLength()
{
	return DEFAULT_LINELEN;
}

// reset + reset china mode + select 866 code page
const byte _HEADER[] = { 0x1b, 0x40, 0x1f, 0x1b, 0xfe, 0x1, 0x1b, 0x74, 0x11 };
const byte _CUT[] = { 0x0a, 0x1d, 0x56, 0x42, 0x10, 0x0a };
const byte _LINEFEED = 0x0a;

void EscPos_Printer::Start()
{
	_buffer.clear();
	_buffer.insert(_buffer.end(), _HEADER, _HEADER + _countof(_HEADER));
}

void EscPos_Printer::Cut()
{
	_buffer.insert(_buffer.end(), _CUT, _CUT + _countof(_CUT));
}

void EscPos_Printer::AppendLine()
{
	_buffer.push_back(_LINEFEED);
}

void EscPos_Printer::AppendLine(const wchar_t* text, Align align /*= Align::Left*/, int mode /*= 0*/)
{
	int lineLen = _lineLength;
	if (mode & PrintMode::DoubleWidth)
		lineLen /= 2;

	if (mode != 0) {
		_buffer.push_back(0x1b);
		_buffer.push_back(0x21);
		_buffer.push_back((byte)mode);
	}

	std::string str = To866(text);
	int len = str.size();
	if (align == Align::Right)
	{
		if (len < lineLen)
			_buffer.insert(_buffer.end(), lineLen - len, 0xff);
	}
	else if (align == Align::Center)
	{
		if (len < lineLen)
			_buffer.insert(_buffer.end(), (lineLen - len) / 2, 0xff);
	}

	_buffer.insert(_buffer.end(), str.begin(), str.end());
	if (mode != 0) {
		_buffer.push_back(0x1b);
		_buffer.push_back(0x21);
		_buffer.push_back(0x0);
	}
	_buffer.push_back(_LINEFEED);
}

void EscPos_Printer::AppendGraphLine(LineType mode)
{
	_buffer.insert(_buffer.end(), _lineLength, (byte)mode);
	_buffer.push_back(_LINEFEED);
}

bool EscPos_Printer::Print()
{
	SECURITY_ATTRIBUTES sa;
	sa.nLength = sizeof(sa);
	sa.lpSecurityDescriptor = NULL;
	sa.bInheritHandle = 0;

	HANDLE hFile = ::CreateFile(
		_printerName.c_str(),
		GENERIC_WRITE,
		FILE_SHARE_READ,
		&sa,
		CREATE_ALWAYS,
		0,
		nullptr /*hTemplateHandle*/
	);
	if (hFile == INVALID_HANDLE_VALUE)
		return false;
	DWORD bytesWritten = 0;

	::WriteFile(hFile, _buffer.data(), _buffer.size(), &bytesWritten, nullptr);

	::CloseHandle(hFile);
	_buffer.clear();
	return true;
}

std::string EscPos_Printer::To866(const wchar_t* text)
{
	UINT acp = 866;

	std::wstring wtext(text);
	std::replace(wtext.begin(), wtext.end(), L'²', L'I');
	std::replace(wtext.begin(), wtext.end(), L'³', L'i');

	std::string result;
	int need = WideCharToMultiByte(acp, 0, wtext.c_str(), -1, nullptr, 0, nullptr, nullptr);
	need -= 1; // null-terminated!
	result.resize(need);
	WideCharToMultiByte(acp, 0, wtext.c_str(), -1, &result[0], need, nullptr, nullptr);
	return result;
}

