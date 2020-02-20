// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "fiscalprinterimpl.h"
#include "fp_DatecsBase.h"
#include "stringtools.h"

#define MAX_COMMAND_LEN 255

#define EMULATION_MODE true

#define SYN 0x16

#define MESSAGE_LENGTH 20
#define NAME_ROW_LENGTH 24

// static 
BYTE CFiscalPrinter_DatecsBase::m_seq = 0x20;

bool CFiscalPrinter_DatecsBase::IS_EMULATION() const
{
	return EMULATION_MODE;
}

#define IDP_FP_ERROR L"Fiscal printer error"
#define IDP_FP_COM_GENERIC L"General COM-port error"


CFiscalPrinter_DatecsBase::CFiscalPrinter_DatecsBase()
	: m_hCom(INVALID_HANDLE_VALUE), m_dwError(0), m_bEndOfTape(false)
{
	ClearBuffers();
}

//virtual 
bool CFiscalPrinter_DatecsBase::IsOpen() const
{
	return m_hCom != INVALID_HANDLE_VALUE;
}

// virtual 
bool CFiscalPrinter_DatecsBase::Open(const wchar_t* Port, DWORD nBaudRate)
{
	try 
	{
		if (IsOpen())
			return true; // already open
		OpenComPort(Port, nBaudRate);
	}
	catch (CFPException ex) {
		m_strError = ex.GetError();
		return false;
	}
	return IsOpen();
}

// virtual 
void CFiscalPrinter_DatecsBase::Close()
{
	ClearBuffers();
	CloseComPort();
}

void CFiscalPrinter_DatecsBase::OpenComPort(const wchar_t* Port, DWORD nBaudRate /*= CBR_19200*/)
{
	TraceINFO(L"DATECS [%s]. Open({Port:'%s', Baud:%ld})", _id.c_str(), Port, (long)nBaudRate);
	if (IS_EMULATION()) {
		m_hCom = (HANDLE)1111;
		return;
	}
	DWORD baudRate = nBaudRate;
	if (baudRate == 0)
		baudRate = CBR_19200;
	m_hCom = CreateFile(Port, GENERIC_READ | GENERIC_WRITE, 0, nullptr, OPEN_EXISTING, 0, nullptr);
	DWORD dwError = 0;
	if (m_hCom == INVALID_HANDLE_VALUE) {
		dwError = ::GetLastError();
		throw CFPException(IDP_FP_COM_GENERIC);
		return;
	}
	DCB dcb = { 0 };
	dcb.DCBlength = sizeof(DCB);
	if (!GetCommState(m_hCom, &dcb)) {
		Close();
		throw CFPException(IDP_FP_COM_GENERIC);
		return;
	}
	dcb.BaudRate = baudRate;      // set the baud rate
	dcb.ByteSize = 8;             // data size, xmit, and rcv
	dcb.Parity = NOPARITY;        // no parity bit
	dcb.StopBits = ONESTOPBIT;    // one stop bit
	dcb.fDtrControl = DTR_CONTROL_DISABLE;
	dcb.fRtsControl = RTS_CONTROL_DISABLE;
	dcb.fAbortOnError = TRUE;
	if (!SetCommState(m_hCom, &dcb)) {
		Close();
		throw CFPException(IDP_FP_COM_GENERIC);
		return;
	}
	COMMTIMEOUTS cmto = { 0 };
	if (!GetCommTimeouts(m_hCom, &cmto)) {
		Close();
		throw CFPException(IDP_FP_COM_GENERIC);
		return;
	}
	cmto.ReadIntervalTimeout = 300;
	cmto.ReadTotalTimeoutConstant = 200;
	cmto.WriteTotalTimeoutConstant = 200;
	cmto.ReadTotalTimeoutMultiplier = 20;
	cmto.WriteTotalTimeoutMultiplier = 20;
	if (!SetCommTimeouts(m_hCom, &cmto)) {
		Close();
		throw CFPException(IDP_FP_COM_GENERIC);
		return;
	}
	if (!PurgeComm(m_hCom, PURGE_RXCLEAR | PURGE_TXCLEAR)) {
		Close();
		throw CFPException(IDP_FP_COM_GENERIC);
		return;
	}
	if (!SetupComm(m_hCom, 1024, 1024)) {
		Close();
		throw CFPException(IDP_FP_COM_GENERIC);
		return;
	}
}

void CFiscalPrinter_DatecsBase::CloseComPort()
{
	if (m_hCom != INVALID_HANDLE_VALUE) {
		::FlushFileBuffers(m_hCom);
		::PurgeComm(m_hCom, PURGE_TXABORT | PURGE_RXABORT | PURGE_TXCLEAR | PURGE_RXCLEAR);
		::CloseHandle(m_hCom);
		m_hCom = INVALID_HANDLE_VALUE;
	}
}

void CFiscalPrinter_DatecsBase::ClearBuffers()
{
	memset(m_sndBuffer, 0, sizeof(m_sndBuffer));
	memset(m_rcvBuffer, 0, sizeof(m_rcvBuffer));
	memset(m_data, 0, sizeof(m_data));
	memset(m_status, 0, sizeof(m_status));
	m_sndBytes = 0;
}

void CFiscalPrinter_DatecsBase::CreateCommand(const wchar_t* name, BYTE cmd)
{
	CreateCommand(name, cmd, L"");
}

void CFiscalPrinter_DatecsBase::CreateCommandV(const wchar_t* name, BYTE cmd, const wchar_t* format, ...)
{
	va_list argList;
	va_start(argList, format);
	wchar_t buff[MAX_COMMAND_LEN];
	vswprintf(buff, MAX_COMMAND_LEN - 1, format, argList);
	CreateCommand(name, cmd, buff);
	va_end(argList);
}

void CFiscalPrinter_DatecsBase::CreateCommand(const wchar_t* name, BYTE cmd, const wchar_t* strCmd)
{
	TraceINFO(L"  %s\tSND:0x%X %s", name, (int) cmd, strCmd);
	std::string cmdA = W2A(strCmd);
	CreateCommandB(cmd, (BYTE*) cmdA.c_str(), (BYTE) cmdA.size());
}

void CFiscalPrinter_DatecsBase::CreateCommandB(BYTE cmd, BYTE* data, BYTE len)
{
	ClearBuffers();
	m_sndBuffer[0] = 0x01; // pre
	m_sndBuffer[1] = len + 4 + 0x20;  // len
	m_sndBuffer[2] = m_seq;  // seq
	m_sndBuffer[3] = cmd;  // command
	for (int i = 0; i < len; i++)
		m_sndBuffer[4 + i] = data[i];
	m_sndBuffer[4 + len] = 0x05; // delim
	m_sndBuffer[5 + len] = 0x00; // crc0
	m_sndBuffer[6 + len] = 0x00; // crc1
	m_sndBuffer[7 + len] = 0x00; // crc2
	m_sndBuffer[8 + len] = 0x00; // crc3
	m_sndBuffer[9 + len] = 0x03; // post
	// end of message
	m_sndBytes = 10 + len;
	CalcSendCRC();
	IncSeq();
}

void CFiscalPrinter_DatecsBase::CalcSendCRC()
{
	// calc CRC
	// m_sndBuffer[1] = len + 4 + 0x20;  // len
	int len = m_sndBuffer[1] - 4 - 0x20;
	_ASSERT(len == (m_sndBytes - 10));
	WORD crc = 0;
	for (int i = 1; i <= 4 + len; i++)
		crc += m_sndBuffer[i];
	m_sndBuffer[5 + len] = (BYTE)((crc & 0xF000) >> 12) + 0x30;
	m_sndBuffer[6 + len] = (BYTE)((crc & 0x0F00) >> 8) + 0x30;
	m_sndBuffer[7 + len] = (BYTE)((crc & 0x00F0) >> 4) + 0x30;
	m_sndBuffer[8 + len] = (BYTE)((crc & 0x000F) >> 0) + 0x30;
}

void CFiscalPrinter_DatecsBase::IncSeqAndBuffer()
{
	m_sndBuffer[2] = m_seq;  // seq
	CalcSendCRC();
	IncSeq();
}

void CFiscalPrinter_DatecsBase::SendCommand(bool bResend /*= true*/)
{
	if (IS_EMULATION())
		return;
	::PurgeComm(m_hCom, PURGE_TXCLEAR | PURGE_RXCLEAR);
	m_bEndOfTape = false;
	m_dwError = 0;
	DWORD dwSent = 0;
	if (!WriteFile(m_hCom, m_sndBuffer, m_sndBytes, &dwSent, NULL)) {
		CloseComPort();
		m_dwError = ::GetLastError();
		ThrowCommonError();
	}
	if (m_sndBytes != dwSent) {
		ThrowCommonError();
	}
	// receive response
	BYTE buff = 0x0;
	DWORD dwRead = 0;
	m_rcvBytes = 0;
	int cnt = 0;
	while (ReadFile(m_hCom, &buff, 1, &dwRead, NULL) && (dwRead == 1)) {
		cnt++;
		if (buff != SYN)
			m_rcvBuffer[m_rcvBytes++] = buff;
	}
	if (m_rcvBytes == 0) {
		// repeat again
		::Sleep(100);
		cnt++;
		TraceINFO(L"DATECS timeout");
		while (ReadFile(m_hCom, &buff, 1, &dwRead, NULL) && (dwRead == 1)) {
			if (buff != SYN)
				m_rcvBuffer[m_rcvBytes++] = buff;
		}
	}

	if (IsDebugMode()) {
		if (cnt == 0)
		{
			// there are no results, try to resend
			TraceINFO(L"DATECS resend command");
			SendCommand();
			return;
		}
	}


	if (!ParseRcv()) {
		ThrowCommonError();
	}

	CheckStatus();
}

// virtual 
void CFiscalPrinter_DatecsBase::CheckStatus()
{
}


// virtual 
std::wstring CFiscalPrinter_DatecsBase::GetLastErrorS()
{
	return L"";
}

void CFiscalPrinter_DatecsBase::ThrowLastError()
{
	std::wstring err = GetLastErrorS();
	throw CFPException(err.c_str());
}

void CFiscalPrinter_DatecsBase::ThrowCommonError()
{
	throw CFPException(IDP_FP_ERROR);
}

void CFiscalPrinter_DatecsBase::IncSeq()
{
	m_seq++;
	if (m_seq > 0x7F)
		m_seq = 0x20;
}

// virtual 
void CFiscalPrinter_DatecsBase::GetErrorCode()
{
}


bool CFiscalPrinter_DatecsBase::ParseRcv()
{
	m_bEndOfTape = false;
	if (m_rcvBytes == 0)
		return false;
	if (m_rcvBuffer[0] != 0x01)
		return false;
	int len = (int)m_rcvBuffer[1] - 0x20;
	int dataLen = len - 11;
	if (dataLen < 0)
		return false;
	BYTE seq = m_rcvBuffer[2];
	BYTE cmd = m_rcvBuffer[3];
	memset(m_data, 0, sizeof(m_data));
	memset(m_status, 0, sizeof(m_status));
	GetErrorCode();
	if (dataLen > 0)
		memcpy(m_data, &m_rcvBuffer[4], dataLen);
	memcpy(m_status, &m_rcvBuffer[5 + dataLen], 6);
	if (m_rcvBuffer[4 + dataLen] != 0x04)
		return false;
	// extra: 0x5, CRC, 0x03
	return true;
}


// virtual 
void CFiscalPrinter_DatecsBase::TraceCommand(const wchar_t* command)
{
	TraceINFO(L"DATECS [%s]. %s", _id.c_str(), command);
}

