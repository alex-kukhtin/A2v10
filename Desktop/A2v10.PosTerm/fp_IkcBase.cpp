// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "equipmentbase.h"
#include "fiscalprinter.h"
#include "fiscalprinterimpl.h"
#include "fp_IkcBase.h"
#include "stringtools.h"
#include "errors.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#define LOPART64(l) ((DWORD)((DWORD64)(l) & 0xffffffff))
#define HIPART64(l) ((DWORD)((DWORD64)(l) >> 32))


#define MESSAGE_LENGTH 20

__int64 makeCodeIks(__int64 art, __currency price) {
	// max (6 byte) = 281 474 976 710 655
	return (art % 10000000) * 10000000 + price.units();
}

CFiscalPrinter_IkcBase::CFiscalPrinter_IkcBase(const wchar_t* model)
	: m_hCom(INVALID_HANDLE_VALUE),
	m_nSeq(1), m_nLastReceiptNo(0), m_bReturnCheck(false),
	m_bytesToSend(0), m_RcvDataLen(0), m_LastDataLen(0),
	m_dwReserved(0), m_dwStatus(0), m_dwError(0), m_dwOsError(0), m_bEndOfTape(false),
	m_sndBytes(0), m_rcvBytes(0), _skipErrors(false)
{
	memset(m_sndBuffer, 0, sizeof(m_sndBuffer));
	memset(m_rcvBuffer, 0, sizeof(m_rcvBuffer));
	memset(m_status, 0, sizeof(m_status));
	memset(m_data, 0, sizeof(m_data));
	_model = model;
}


//virtual 
CFiscalPrinter_IkcBase::~CFiscalPrinter_IkcBase()
{
	Close();
}

// virtual 
bool CFiscalPrinter_IkcBase::Open(const wchar_t* Port, DWORD nBaudRate)
{
	try {
		if (IsOpen())
			return true; // already opened
		OpenComPort(Port, nBaudRate);
		_port = Port;
	}
	catch (EQUIPException e) {
		//e.ReportError2();
		return false;
	}
	return IsOpen();
}

// virtual 
void CFiscalPrinter_IkcBase::Init()
{
	TraceINFO(L"IKCBASE [%s]. Init()", _id.c_str());

	__try {
		_skipErrors = true;
		//0x25014D5A38303034303031322030332D30392D3134000000000000000000000000000000000000004D5A2D3131
		CreateCommand(L"SENDSTATUS", FP_SEND_STATUS);
		SendCommand();
	}
	__finally {
		_skipErrors = false;
	}

	GetPrinterPayModes();
	GetPrinterTaxRates();

	CreateCommand(L"RESET_ORDER", FP_RESET_ORDER);
	SendCommand();

	// Get status (with buffer print)

	RCP_NO rcp;
	GetPrinterLastReceiptNo(rcp); // for status processing
	m_nLastReceiptNo = rcp.saleno;
	m_nLastZReportNo = rcp.zno;

	if (!m_nLastZReportNo) {
		time_t time = std::time(0);
		tm tm;
		localtime_s(&tm, &time);
		m_nLastZReportNo = tm.tm_year * 10000 + tm.tm_hour * 100 + tm.tm_mday;
	}
}

void CFiscalPrinter_IkcBase::GetPrinterPayModes()
{
	// do nothing - predefined
}

bool CFiscalPrinter_IkcBase::OpenComPort(const wchar_t* strPort, int nBaud)
{
	m_hCom = CreateFile(strPort, GENERIC_READ | GENERIC_WRITE, 0, NULL, OPEN_EXISTING, 0, NULL);
	DWORD dwError = 0;
	if (m_hCom == INVALID_HANDLE_VALUE)
	{
		dwError = ::GetLastError();
		return false;
	}
	DCB dcb = { 0 };
	dcb.DCBlength = sizeof(DCB);
	if (!GetCommState(m_hCom, &dcb)) {
		dwError = ::GetLastError();
		Close();
		return false;
	}
	dcb.BaudRate = nBaud;         // set the baud rate
	dcb.ByteSize = 8;             // data size, xmit, and rcv
	dcb.Parity = NOPARITY;        // no parity bit
	dcb.StopBits = ONESTOPBIT;    // one stop bit
	dcb.fDtrControl = DTR_CONTROL_DISABLE;
	dcb.fRtsControl = RTS_CONTROL_DISABLE;
	dcb.fAbortOnError = TRUE;
	if (!SetCommState(m_hCom, &dcb)) {
		dwError = ::GetLastError();
		Close();
		return false;
	}
	COMMTIMEOUTS cmto = { 0 };
	if (!GetCommTimeouts(m_hCom, &cmto)) {
		dwError = ::GetLastError();
		Close();
		return false;
	}
	cmto.ReadIntervalTimeout = 50;
	cmto.ReadTotalTimeoutConstant = 100;
	cmto.WriteTotalTimeoutConstant = 100;
	cmto.ReadTotalTimeoutMultiplier = 10;
	cmto.WriteTotalTimeoutMultiplier = 10;
	if (!SetCommTimeouts(m_hCom, &cmto)) {
		dwError = ::GetLastError();
		Close();
		return false;
	}
	if (!PurgeComm(m_hCom, PURGE_RXCLEAR | PURGE_TXCLEAR)) {
		dwError = ::GetLastError();
		Close();
		return false;
	}
	if (!SetupComm(m_hCom, 1024, 1024)) {
		dwError = ::GetLastError();
		Close();
		return false;
	}
	return true;
}


void CFiscalPrinter_IkcBase::CloseComPort()
{
	if (m_hCom == INVALID_HANDLE_VALUE)
		return;
	::FlushFileBuffers(m_hCom);
	::PurgeComm(m_hCom, PURGE_TXABORT | PURGE_RXABORT | PURGE_TXCLEAR | PURGE_RXCLEAR);
	::CloseHandle(m_hCom);
	m_hCom = INVALID_HANDLE_VALUE;
}

void CFiscalPrinter_IkcBase::ClearBuffers()
{
	memset(m_sndBuffer, 0, sizeof(m_sndBuffer));
	memset(m_rcvBuffer, 0, sizeof(m_rcvBuffer));
	m_bytesToSend = 0;
	m_RcvDataLen = 0;
	m_LastDataLen = 0;
	m_dwStatus = 0;
	m_dwError = 0;
	m_dwReserved = 0;
	m_bEndOfTape = false;
}

// virtual 
void CFiscalPrinter_IkcBase::Close()
{
	ClearBuffers();
	CloseComPort();
}


void CFiscalPrinter_IkcBase::CreateCommand(const wchar_t* name, FP_COMMAND cmd, BYTE* pData /*= NULL*/, int DataLen /*= 0*/)
{
	_ASSERT(false);
}

void CFiscalPrinter_IkcBase::ReadAll()
{
	BYTE buff = 0x0;
	DWORD dwRead = 0;
	while (ReadFile(m_hCom, &buff, 1, &dwRead, NULL))
	{
		if (dwRead == 0)
			return;
	}
}

void CFiscalPrinter_IkcBase::SendCommand()
{
	_ASSERT(FALSE);
}


void CFiscalPrinter_IkcBase::IncSeq()
{
	m_nSeq++;
}

void CFiscalPrinter_IkcBase::ThrowOsError(DWORD dwOsError)
{
	WCHAR buffer[1024];
	::FormatMessage(FORMAT_MESSAGE_FROM_SYSTEM, NULL, dwOsError, 0, buffer, 1023, 0);
	throw EQUIPException(buffer);
}

void CFiscalPrinter_IkcBase::ThrowInternalError(const wchar_t* szError)
{
	throw EQUIPException(szError);
}

void CFiscalPrinter_IkcBase::ThrowCommonError()
{
	if (_skipErrors)
		return;
	auto err = FPGetLastError();
	if (err.length() == 0)
		return;
	throw EQUIPException(err.c_str());
}

void CFiscalPrinter_IkcBase::ParseStatus()
{
	// ACK, DLE, STX, No, Code, Status, Result, Reserved
	// 0,   1,   2,   3,  4,    5,      6,      7
	m_dwStatus = m_rcvBuffer[5];
	m_dwError = m_rcvBuffer[6];
	m_dwReserved = m_rcvBuffer[7];
	m_bEndOfTape = false;
	if ((m_dwStatus & 0x1) && (m_dwReserved & 0x4))
		m_bEndOfTape = true;
	if ((m_dwStatus != 0) || (m_dwError != 0))
	{
		ThrowCommonError();
	}
}

// virtual
BYTE CFiscalPrinter_IkcBase::CalcCheckSum(BYTE* pBytes, int dataLen)
{
	BYTE x = 0;
	for (int i = 0; i < dataLen + 2; i++)
		x += pBytes[i + 2];
	return (~x + 1);
}

// virtual 
void CFiscalPrinter_IkcBase::RecalcCrcSum()
{
}


int CFiscalPrinter_IkcBase::GetCash_()
{
	CreateCommand(L"GET_CASH", FP_GET_CASH);
	SendCommand();
	BYTE Data[5] = { 0 }; // amount in coins
	GetData(Data, 5);
	TraceINFO(L"  DAT:%s", _Byte2String(Data, 5).c_str());
	_ASSERT(Data[4] == 0);  // no data
	_ASSERT(Data[3] < 128); // less then
	int x = Data[3] * 16777216 + Data[2] * 65536 + Data[1] * 256 + Data[0];
	return x;
}

void CFiscalPrinter_IkcBase::GetData(BYTE* pData, int DataLen)
{
	memset(pData, 0, DataLen);
	if (DataLen > m_RcvDataLen)
		DataLen = m_RcvDataLen;
	for (int i = 0; i < DataLen; i++)
		pData[i] = m_rcvBuffer[8 + i];
}

// virtual 
/*
bool CFiscalPrinter_IkcBase::GetCash(DB_ID termId, COleCurrency& cy)
{
	try
	{
		long cash = GetCash_();
		cy = CCyT::MakeCurrency(cash / 100, cash % 100);
	}
	catch (EQUIPException ex)
	{
		//ex.ReportError2();
		return false;
	}
	return true;
}
*/

// virtual 
SERVICE_SUM_INFO CFiscalPrinter_IkcBase::ServiceInOut(bool bOut, __currency asum, bool bOpenCashDrawer)
{
	TraceINFO(L"IKCBASE [%s]. ServiceInOut({out: %s, amount: %ld, openCashDrawer: %s})", _id.c_str(),
		bool2string(bOut), asum.units(), bool2string(bOpenCashDrawer));

	long amount = asum.units();
	if (amount != 0) {
		DWORD val = (DWORD)(amount);
		BYTE sum[4] = { 0 };
		sum[0] = LOBYTE(LOWORD(val));
		sum[1] = HIBYTE(LOWORD(val));
		sum[2] = LOBYTE(HIWORD(val));
		sum[3] = HIBYTE(HIWORD(val));
		FP_COMMAND cmd = bOut ? FP_SVC_OUT : FP_SVC_IN;
		CreateCommand(L"SVC_IN_OUT", cmd, (BYTE*)sum, 4);
		SendCommand();
	}
	int coins = GetCash_();
	SERVICE_SUM_INFO info;
	info.sumOnHand = __currency::from_units(coins);


	if (bOpenCashDrawer)
		OpenCashDrawer();
	return info;
}

#pragma pack(push, 1)

struct REPPWD_INFO
{
	BYTE pwd[2];
	REPPWD_INFO()
	{
		pwd[0] = 0;
		pwd[1] = 0;
	}
};

struct COMMENT_INFO
{
	BYTE len;
	CHAR Text[256];
};

struct IKC_PAYMENT_INFO
{
	BYTE State; // bit 0:3 - payment type, bit 6-non fiscal receipt
	DWORD Payment; // bit 31: - auto close receipt
	BYTE Reserved;
	BYTE CodeLen;  // auth code len

	void SetPaymentType(PAY_TYPE pt)
	{
		State |= pt & 0x07;
	}

	void SetAutoClose(bool bSet)
	{
		if (bSet)
			Payment |= 0x80000000;
		else
			Payment &= ~0x80000000;
	}
};


struct ARTICLE_INFO_CMD {
	BYTE code[6];
	void SetCode(long art) {
		code[0] = LOBYTE(LOWORD(art));
		code[1] = HIBYTE(LOWORD(art));
		code[2] = LOBYTE(HIWORD(art));
		code[3] = HIBYTE(HIWORD(art));
		code[4] = 0;
		code[5] = 0;
	}
};

struct ARTICLE_INFO {
	BYTE namelen;
	BYTE tail[511];
};

struct SALE_INFO
{
	BYTE qty[3];
	BYTE status;
	BYTE price[4];
	BYTE tax;
	BYTE len;
	BYTE name[75 + 6];
	BYTE code[6];

	SALE_INFO()
	{
		memset(this, 0, sizeof(SALE_INFO));
		tax = 0x85; // E - predefined
	}
	void SetName(const wchar_t* szText, __int64 art)
	{
		len = CFiscalPrinter_IkcBase::ConvertText(szText, (char*)name, 76, 75);
		DWORD dwLow = LOPART64(art);
		DWORD dwHi = HIPART64(art);
		code[0] = LOBYTE(LOWORD(dwLow));
		code[1] = HIBYTE(LOWORD(dwLow));
		code[2] = LOBYTE(HIWORD(dwLow));
		code[3] = HIBYTE(HIWORD(dwLow));
		code[4] = LOBYTE(LOWORD(dwHi));
		code[5] = HIBYTE(LOWORD(dwHi));
		// move code to name
		for (int i = 0; i < 6; i++)
			name[i + len] = code[i];
	}
	void SetTax(int code)
	{
		// 0x80 = VAT
		// 0x81 = 0%
		// 0x82 == VAT+EXCISE
		tax = code;
	}

	int GetLength()
	{
		return 3 + 1 + 4 + 1 + 1 + len + 6;
	}

	void SetQtyPrice(int sqty, int sprice)
	{
		status = 0x3; // precision = 3
		price[0] = LOBYTE(LOWORD(sprice));
		price[1] = HIBYTE(LOWORD(sprice));
		price[2] = LOBYTE(HIWORD(sprice));
		price[3] = HIBYTE(HIWORD(sprice));

		qty[0] = LOBYTE(LOWORD(sqty));
		qty[1] = HIBYTE(LOWORD(sqty));
		qty[2] = LOBYTE(HIWORD(sqty));
	}
};

struct FPDISCOUNT_INFO
{
	BYTE op;
	DWORD value;
	BYTE len;
	BYTE name[25];

	FPDISCOUNT_INFO()
	{
		memset(this, 0, sizeof(FPDISCOUNT_INFO));
	}
	void SetPercent(int prc, BYTE cmd)
	{
		op = cmd; // 0 or 3 - discount % for the last row
		value = (DWORD)prc;
		value |= 0x04000000; // порядок + 2
		if (prc > 0)
			value |= 0x80000000; // bit 31 - discount
	}
	void SetSum(int sum, BYTE cmd)
	{
		op = cmd; // 2 or 4 - discount sum for the last row
		value = (DWORD)sum;
		if (sum > 0)
			value |= 0x80000000; // bit 31 - discount
	}
	void SetName(const wchar_t* szText)
	{
		len = CFiscalPrinter_IkcBase::ConvertText(szText, (char*)name, 25, 25);
	}

	int GetLength()
	{
		return 1 + 4 + 1 + len;
	}
};


struct DISPLAY_INFO
{
	BYTE row; // 0.1
	BYTE len;
	BYTE string[MESSAGE_LENGTH + 1];

	DISPLAY_INFO()
	{
		memset(this, 0, sizeof(DISPLAY_INFO));
	}

	void SetName(const wchar_t* szText)
	{
		len = CFiscalPrinter_IkcBase::ConvertText(szText, (char*)string, 21, 20);
	}

	int GetLength()
	{
		return 1 + 1 + len;
	}
};

struct REPNO_INFO
{
	BYTE pwd[2];
	WORD from;
	WORD to;
	REPNO_INFO()
	{
		pwd[0] = 0;
		pwd[1] = 0;
	}
};

struct REPDATE_INFO
{
	BYTE pwd[2];
	BYTE from[3]; // BCD
	BYTE to[3];
	REPDATE_INFO()
	{
		pwd[0] = 0;
		pwd[1] = 0;
	}
	void SetDateFrom(const tm& tm)
	{
		int y = tm.tm_year - 100;
		int m = tm.tm_mon + 1;
		int d = tm.tm_mday;
		from[0] = ((d / 10) << 4) + (d % 10);  // day
		from[1] = ((m / 10) << 4) + (m % 10);
		from[2] = ((y / 10) << 4) + (y % 10);
	}
	void SetDateTo(const tm& tm)
	{
		int y = tm.tm_year - 100;
		int m = tm.tm_mon + 1;
		int d = tm.tm_mday;
		to[0] = ((d / 10) << 4) + (d % 10);  // day
		to[1] = ((m / 10) << 4) + (m % 10);
		to[2] = ((y / 10) << 4) + (y % 10);
	}
};

struct GET_TAX_RATES {
	BYTE taxnums;
	BYTE taxdate[3];
	BYTE taxrates[255];

	BYTE getStatus() {
		BYTE* pX = taxrates + taxnums * 2;
		return *pX;
	}

	int Precision() {
		BYTE stat = getStatus();
		return stat & 0x03;
	}

	int TaxRate(int i) {
		int ix = i * 2;
		return taxrates[ix + 1] * 256 + taxrates[ix];
	}

	int Fee(int i) {
		BYTE* pX = taxrates + taxnums * 2 + 1;
		int ix = i * 2;
		return pX[ix + 1] * 256 + pX[ix];
	}
};

struct DAYREPORT_INFO_0
{
	WORD schecks;
	/* 6 tax groups and 10 payment modes */
	BYTE sale_t_0[4];
	BYTE sale_t_1[4];
	BYTE sale_t_2[4];
	BYTE sale_t_3[4];
	BYTE sale_t_4[4];
	BYTE sale_t_5[4];
	BYTE sum_p_0[4];
	BYTE sum_p_1[4];
	BYTE sum_p_2[4];
	BYTE sum_p_3[4];
	BYTE sum_p_4[4];
	BYTE sum_p_5[4];
	BYTE sum_p_6[4];
	BYTE sum_p_7[4];
	BYTE sum_p_8[4];
	BYTE sum_p_9[4];

	BYTE x1[4];  // day sales margin
	BYTE x2[4];  // day sales discount
	BYTE cashin[4];  // day service-in sum

	WORD retrcpcount; //  return receipt counter
	/* 4 * returns counter by payment modes */
	BYTE ret_t_0[4];
	BYTE ret_t_1[4];
	BYTE ret_t_2[4];
	BYTE ret_t_3[4];
	BYTE ret_t_4[4];
	BYTE ret_t_5[4];
	BYTE ret_p_0[4];
	BYTE ret_p_1[4];
	BYTE ret_p_2[4];
	BYTE ret_p_3[4];
	BYTE ret_p_4[4];
	BYTE ret_p_5[4];
	BYTE ret_p_6[4];
	BYTE ret_p_7[4];
	BYTE ret_p_8[4];
	BYTE ret_p_9[4];

	BYTE y1[4]; // day payout margin
	BYTE y2[4]; // day payout discount
	BYTE cashout[4]; // day service-out sum

	LONG GetCashIn()
	{
		return cashin[3] * 16777216 + cashin[2] * 65536 + cashin[1] * 256 + cashin[0];
	}
	LONG GetCashOut()
	{
		return cashout[3] * 16777216 + cashout[2] * 65536 + cashout[1] * 256 + cashout[0];
	}

	LONG SaleTax(int no) {
		if (no > 5)
			return 0;
		BYTE* p = sale_t_0 + (no * 4);
		return p[3] * 16777216 + p[2] * 65536 + p[1] * 256 + p[0];
	}

	LONG SalePayment(int no) {
		if (no > 9)
			return 0;
		BYTE* p = sum_p_0 + (no * 4);
		return p[3] * 16777216 + p[2] * 65536 + p[1] * 256 + p[0];
	}

	LONG RetTax(int no) {
		if (no > 5)
			return 0;
		BYTE* p = ret_t_0 + (no * 4);
		return p[3] * 16777216 + p[2] * 65536 + p[1] * 256 + p[0];
	}

	LONG RetPayment(int no) {
		if (no > 9)
			return 0;
		BYTE* p = ret_p_0 + (no * 4);
		return p[3] * 16777216 + p[2] * 65536 + p[1] * 256 + p[0];
	}
};

struct DAYREPORT_INFO_TAG_0 {
	WORD zrepno;
	WORD salercpcnt;
	WORD retrcpcnt;
	BYTE dateendsession[3];
	BYTE timeendsession[2];
	BYTE datelastzrep[3];
	WORD artcnt;
};

struct DAYREPORT_INFO_TAG_1 {
	BYTE tax0_0[4];
	BYTE tax0_1[4];
	BYTE tax0_2[4];
	BYTE tax0_3[4];
	BYTE tax0_4[4];
	BYTE tax0_5[4];
	BYTE tax1_0[4];
	BYTE tax1_1[4];
	BYTE tax1_2[4];
	BYTE tax1_3[4];
	BYTE tax1_4[4];
	BYTE tax1_5[4];
};


#pragma pack(pop)


void CFiscalPrinter_IkcBase::GetPrinterTaxRates()
{
	CreateCommand(L"GETTAXRATES", FP_GETTAXRATES);
	SendCommand();
	GET_TAX_RATES taxRates;
	GetData((BYTE*)&taxRates, sizeof(GET_TAX_RATES));

	int status = taxRates.getStatus();
	for (int i = 0; i < taxRates.taxnums; i++) {
		int rate = taxRates.TaxRate(i);
		int fee = taxRates.Fee(i);
		TAX_KEY taxKey;
		taxKey.tax = rate;
		taxKey.nested = fee != 0 ? 500 : 0;
		_taxChars[taxKey.key] = 0x80 + i;
	}

	TAX_KEY key;
	for (auto it = _taxChars.begin(); it != _taxChars.end(); ++it) {
		key.key = it->first;
		int code = it->second;
		TraceINFO(L"  Tax mode: code: 0x%02x, tax: %ld, nested:%ld", code, key.tax, key.nested);
	}
}

int CFiscalPrinter_IkcBase::FindTaxCode(long tax, long excise)
{
	TAX_KEY key;
	for (auto it = _taxChars.begin(); it != _taxChars.end(); ++it) {
		key.key = it->first;
		int code = it->second;
		if (key.tax == tax && key.nested == excise)
			return code;
	}
	return -1;
}

// virtual 
void CFiscalPrinter_IkcBase::SetParams(const PosConnectParams& prms)
{
}

// static 
int CFiscalPrinter_IkcBase::ConvertText(const wchar_t* szText, char* text, int bufSize, size_t maxSize)
{
	UINT acp = 866;
	std::wstring wstr(szText);
	std::replace(wstr.begin(), wstr.end(), L'І', L'I');
	std::replace(wstr.begin(), wstr.end(), L'і', L'i');
	if (wstr.length() > maxSize)
		wstr.resize(maxSize);
	// without '\0'!!!
	return ::WideCharToMultiByte(866 /* UA */, 0, wstr.c_str(), -1, text, bufSize, nullptr, nullptr) - 1;
}



void CFiscalPrinter_IkcBase::Comment(const wchar_t* szComment, int maxSize)
{
	COMMENT_INFO ci = { 0 };
	ci.len = ConvertText(szComment, ci.Text, 255, maxSize);
	CreateCommand(L"COMMENT", FP_COMMENT, (BYTE*)&ci, ci.len + 1);
	SendCommand();
}


// virtual 
void CFiscalPrinter_IkcBase::CancelOrCloseReceipt()
{

}
// virtual
void CFiscalPrinter_IkcBase::CancelReceiptUnconditional()
{

}

// virtual 
void CFiscalPrinter_IkcBase::PrintReceiptItem(const RECEIPT_ITEM& item)
{
	__int64 art = item.article * 2; // sale/ret diff
	FP_COMMAND fpcmd = FP_SALE_ITEM;
	if (m_bReturnCheck) {
		fpcmd = FP_RETURN_ITEM;
		art += 1;
	}
	__int64 code = makeCodeIks(art, item.price);

	SALE_INFO si;
	si.SetName(item.name, code);

	if (item.qty)
	{
		si.SetQtyPrice(item.qty * 1000, item.price.units());
	}
	else if (item.weight.units())
	{
		si.SetQtyPrice(item.weight.units(), item.price.units());
	}
	int taxCode = FindTaxCode(item.vat, item.excise);
	if (taxCode == -1)
		throw EQUIPException(L"Invalid tax code");
	si.SetTax(taxCode);
	CreateCommand(L"SALE_OR_RETURN", fpcmd, (BYTE*)&si, si.GetLength());
	SendCommand();

	/*use discount here*/
	if (item.discount) {
		FPDISCOUNT_INFO di;
		di.SetSum(item.discount.units(), 1 /*sum for item*/);
		CreateCommand(L"DISCOUNT", FP_DISCOUNT, (BYTE*)&di, 6 + di.len);
		SendCommand();
	}
}

// virtual 
void CFiscalPrinter_IkcBase::AddArticle(const RECEIPT_ITEM& item)
{

}

// virtual 
void CFiscalPrinter_IkcBase::Payment(PAYMENT_MODE mode, long sum)
{
	switch (mode)
	{
	case PAYMENT_MODE::_pay_cash:
		Payment(sum, PAY_TYPE::FP_PAYTYPE_CASH, true);
		break;
	case PAYMENT_MODE::_pay_card:
		Payment(sum, PAY_TYPE::FP_PAYTYPE_CARD, true);
		break;
	}
}

//
void CFiscalPrinter_IkcBase::Payment(LONG Sum, PAY_TYPE pt, bool bAutoClose)
{
	IKC_PAYMENT_INFO pi = { 0 };
	pi.Payment = Sum;
	pi.SetPaymentType(pt);
	pi.SetAutoClose(bAutoClose);
	CreateCommand(L"PAYMENT", FP_PAYMENT, (BYTE*)&pi, 7);
	SendCommand();
}

// virtual 
void CFiscalPrinter_IkcBase::OpenCashDrawer()
{
	CreateCommand(L"CASH_DRAWER", FP_CASH_DRAWER);
	SendCommand();
}

// virtual 
long CFiscalPrinter_IkcBase::NullReceipt(bool bOpenCashDrawer)
{
	TraceINFO(L"IKSBASE [%s]. NullReceipt({openCashDrawer=%s})", _id.c_str(), bool2string(bOpenCashDrawer));
	CreateCommand(L"RESET_ORDER", FP_RESET_ORDER);
	SendCommand();
	Comment(L"НУЛЬОВИЙ ЧЕК", 27);
	Payment(0, FP_PAYTYPE_CASH, true);
	CheckPaperStatus();
	RCP_NO rcp;
	GetPrinterLastReceiptNo(rcp);
	m_nLastReceiptNo = rcp.saleno;

	if (bOpenCashDrawer)
		OpenCashDrawer();
	return m_nLastReceiptNo;
}


// virtual
void CFiscalPrinter_IkcBase::CheckPaperStatus()
{
}

// virtual
long CFiscalPrinter_IkcBase::CopyReceipt()
{
	CreateCommand(L"PRINTCOPY", FP_PRINTCOPY);
	SendCommand();
	return m_nLastReceiptNo;
}

// virtual 
bool CFiscalPrinter_IkcBase::PrintDiagnostic()
{
	try {
		CreateCommand(L"PRINTVER", FP_PRINTVER);
		SendCommand();
	}
	catch (EQUIPException e) {
		//e.ReportError2();
		return false;
	}
	return true;
}


// virtual 
bool CFiscalPrinter_IkcBase::CancelCheck(bool& bClosed)
{
	try
	{
		bClosed = false;
		CreateCommand(L"RESET_ORDER", FP_RESET_ORDER);
		SendCommand();
	}
	catch (EQUIPException e)
	{
		m_strError = e.GetError(); // без сообщения
		return false;
	}
	return true;
}

// virtual 
void CFiscalPrinter_IkcBase::DisplayRow(int nRow, const wchar_t* szString, TEXT_ALIGN align)
{
	m_bReturnCheck = false;
	std::wstring msg(szString);
	int len = msg.length();
	if (len > MESSAGE_LENGTH)
		msg.resize(MESSAGE_LENGTH);
	else {
		if (align == TEXT_ALIGN::_center)
		{
			std::wstring pad(L' ', (MESSAGE_LENGTH - len) / 2);
			pad.append(msg.c_str());
			msg = pad;
		}
		else if (align == TEXT_ALIGN::_right) {
			std::wstring pad(L' ', (MESSAGE_LENGTH - len));
			pad.append(msg.c_str());
			msg = pad;
		}
	}
	try
	{
		DISPLAY_INFO di;
		if (nRow != 0)
			di.row = 1;
		di.SetName(msg.c_str());
		CreateCommand(L"DISPLAY_ROW", FP_DISPLAY_ROW, (BYTE*)&di, di.GetLength());
		SendCommand();
	}
	catch (EQUIPException /*e*/)
	{
		// no execption 
	}
}

// virtual 
void CFiscalPrinter_IkcBase::OpenReceipt()
{
	m_bReturnCheck = false;
	CreateCommand(L"RESET_ORDER", FP_RESET_ORDER);
	SendCommand();
}

// virtual 
/*
bool CFiscalPrinter_IkcBase::CloseCheck(int sum, int get, CFiscalPrinter::PAY_MODE pm, const wchar_t* szText /*= NULL* /)
{
	try
	{
		PAY_TYPE pt = FP_PAYTYPE_CASH;
		if (pm == CFiscalPrinter::_fpay_card)
		{
			pt = FP_PAYTYPE_CARD;
			_ASSERT(get == sum);
		}
		else if (pm == CFiscalPrinter::_fpay_credit)
			pt = FP_PAYTYPE_NOCSH;
		Payment(get, pt, false);
		CreateCommand(FP_RESET_ORDER);
		SendCommand();
		CreateCommand(FP_CASH_DRAWER);
		SendCommand();
		GetLastCheckNo(0, true); // получим ID чека
		m_bReturnCheck = false;
	}
	catch (EQUIPException ex)
	{
		//ex.ReportError2();
		return false;
	}
	return true;
}
*/

// virtual 
long CFiscalPrinter_IkcBase::CloseReceipt(bool bDisplay)
{
	RCP_NO rcp;
	GetPrinterLastReceiptNo(rcp);
	m_nLastReceiptNo = rcp.saleno;
	long ret = m_nLastReceiptNo;
	if (m_bReturnCheck)
		ret = rcp.retno;
	m_bReturnCheck = false;
	return ret;
}


// virtual 
/*
CString CFiscalPrinter_IkcBase::FPGetLastError()
{
	_ASSERT(false);
	return EMPTYSTR;
}
*/

// virtual 
void CFiscalPrinter_IkcBase::OpenReturnReceipt()
{
	CreateCommand(L"RESET_ORDER", FP_RESET_ORDER);
	SendCommand();
	COMMENT_INFO ci = { 0 };
	ci.len = ConvertText(L"ВИДАТКОВИЙ ЧЕК", ci.Text, 255, 27);
	ci.len |= 0x80; // high bit - return receipt
	CreateCommand(L"COMMENT", FP_COMMENT, (BYTE*)&ci, ci.len + 1);
	SendCommand();
	m_bReturnCheck = true;
}

// virtual 
long CFiscalPrinter_IkcBase::XReport()
{
	REPPWD_INFO pi;
	CreateCommand(L"XREPORT", FP_XREPORT, (BYTE*)&pi, 2);
	SendCommand();
	// last receipt no
	//GetLastCheckNo();
	return m_nLastReceiptNo;
}

// virtual 
ZREPORT_RESULT CFiscalPrinter_IkcBase::ZReport()
{
	REPPWD_INFO pi;
	CreateCommand(L"ZREPORT", FP_ZREPORT, (BYTE*)&pi, 2);
	SendCommand();
	ZREPORT_RESULT result;
	RCP_NO rcp;
	GetPrinterLastReceiptNo(rcp);
	m_nLastReceiptNo = rcp.saleno;
	m_nLastZReportNo = GetPrinterLastZReportNo();
	result.no = m_nLastReceiptNo;
	result.zno = m_nLastZReportNo;
	return result;
}

long CFiscalPrinter_IkcBase::GetPrinterLastZReportNo()
{
	DAYREPORT_INFO_TAG_0 info_0 = { 0 };
	DayReport_Tag(&info_0, 0, sizeof(DAYREPORT_INFO_TAG_0));
	return info_0.zrepno;
}

void CFiscalPrinter_IkcBase::GetPrinterLastReceiptNo(RCP_NO& rcp)
{
	DAYREPORT_INFO_TAG_0 info_0 = { 0 };
	DayReport_Tag(&info_0, 0, sizeof(DAYREPORT_INFO_TAG_0));
	rcp.saleno = info_0.salercpcnt;
	rcp.retno = info_0.retrcpcnt;
	rcp.zno = info_0.zrepno;

}

/*
// virtual
bool CFiscalPrinter_IkcBase::PeriodicalByDate(BOOL Short, COleDateTime From, COleDateTime To)
{
	try
	{
		FP_COMMAND cmd = Short ? FP_PREP_DATE_S : FP_PREP_DATE_F;
		REPDATE_INFO rdi;
		rdi.SetDateFrom(From);
		rdi.SetDateTo(To);
		CreateCommand(cmd, (BYTE*)&rdi, sizeof(REPDATE_INFO));
		SendCommand();
	}
	catch (EQUIPException ex)
	{
		//ex.ReportError2();
		return false;
	}
	return true;
}
*/

// virtual 
long CFiscalPrinter_IkcBase::PeriodReport(const wchar_t* report, bool bShort, const wchar_t* from, const wchar_t* to)
{
	return m_nLastReceiptNo;
}

// virtual 
bool CFiscalPrinter_IkcBase::PeriodicalByNo(BOOL Short, LONG From, LONG To)
{
	try
	{
		REPNO_INFO rni;
		rni.from = (WORD)From;
		rni.to = (WORD)To;
		CreateCommand(L"PREP_NO_F", FP_PREP_NO_F, (BYTE*)&rni, sizeof(REPNO_INFO));
		SendCommand();
	}
	catch (EQUIPException ex)
	{
		//ex.ReportError2();
		return false;
	}
	return true;
}

// virtual 
bool CFiscalPrinter_IkcBase::ReportModemState()
{
	throw EQUIPException(L"Yet not implemented");
	return false;
}

// virtual 
bool CFiscalPrinter_IkcBase::ReportByArticles()
{
	try
	{
		REPPWD_INFO rpi;
		CreateCommand(L"REP_ART", FP_REP_ART, (BYTE*)&rpi, sizeof(REPPWD_INFO));
		SendCommand();
	}
	catch (EQUIPException ex)
	{
		//ex.ReportError2();
		return false;
	}
	return true;
}

// virtual 
bool CFiscalPrinter_IkcBase::IsEndOfTape()
{
	return m_bEndOfTape;
}

// virtual 
bool CFiscalPrinter_IkcBase::PrintDiscount(LONG Type, LONG Value, const wchar_t* szDescr)
{
	bool bAdd = false;
	FPDISCOUNT_INFO di;
	try
	{
		if ((Type < 0) || (Type > 3))
			throw EQUIPException(L"Invalid discount type. Valid is 0..3");
		di.SetName(szDescr);
		switch (Type) {
		case 0: // % скидка на строку
			di.SetPercent(Value, 0);
			break;
		case 1: // сумма скидка на строку
			di.SetSum(Value, 1);
			break;
		case 2: // % скидка на подытог
			di.SetPercent(Value, 2);
			break;
		case 3: // сумма скидка на строку
			di.SetSum(Value, 3);
			break;
		}
		CreateCommand(L"DISCOUNT", FP_DISCOUNT, (BYTE*)&di, 6 + di.len);
		SendCommand();
	}
	catch (EQUIPException ex) {
		//ex.ReportError2();
		return false;
	}
	return true;
}

// virtual 
void CFiscalPrinter_IkcBase::PrintNonFiscalText(const wchar_t* szText)
{
	throw EQUIPException(L"Yet not implemented");
	/*
	CString str(szText);
	int len = str.GetLength();
	if (len > 255)
		len = 255;
	Comment(szText, len);
	*/
}

// virtual 
void CFiscalPrinter_IkcBase::PrintFiscalText(const wchar_t* szText)
{
	throw EQUIPException(L"Yet not implemented");
}

// virtual 
void CFiscalPrinter_IkcBase::DisplayClear()
{
	DisplayRow(0, L"", TEXT_ALIGN::_left);
	DisplayRow(1, L"", TEXT_ALIGN::_left);
}

// virtual 
void CFiscalPrinter_IkcBase::DisplayDateTime()
{
	//throw EQUIPException(L"Yet not implemented");
}

// virtual 
void CFiscalPrinter_IkcBase::GetStatusMessages(std::vector<std::wstring>& msgs)
{
	if (m_dwStatus & 0x20) { // bit5
		msgs.push_back(FP_W_SHIFT_EXPIRED);
	}
}

// virtual 
void CFiscalPrinter_IkcBase::TraceCommand(const wchar_t* command)
{
	TraceINFO(L"IKCBASE [%s]. %s", _id.c_str(), command);
}

// virtual 
void CFiscalPrinter_IkcBase::GetErrorCode()
{
}

// virtual 
void CFiscalPrinter_IkcBase::SetCurrentTime()
{
	throw EQUIPException(L"Yet not implemented");
}


void CFiscalPrinter_IkcBase::PrintTotal()
{
	// do nothing
}

// virtual 
void CFiscalPrinter_IkcBase::GetPrinterInfo(JsonObject& json)
{
	json.Add(L"model", _model.c_str());
	json.Add(L"port", _port.c_str());
	json.Add(L"zno", m_nLastZReportNo);
	json.Add(L"version", POS_MODULE_VERSION());
}


void CFiscalPrinter_IkcBase::DayReport_(void* Info)
{
	DAYREPORT_INFO_0* pInfo = reinterpret_cast<DAYREPORT_INFO_0*>(Info);
	CreateCommand(L"GETDAYINFO", FP_GETDAYINFO);
	SendCommand();
	GetData((BYTE*)pInfo, sizeof(DAYREPORT_INFO_0));
}

void CFiscalPrinter_IkcBase::DayReport_Tag(void* pInfo, BYTE tag, size_t infoSize)
{
	BYTE xTag = tag;
	CreateCommand(L"GETDAYINFO", FP_GETDAYINFO, &xTag, 1);
	SendCommand();
	GetData((BYTE*)pInfo, infoSize);
}

static long _calcTax(long sum, long taxval) {
	if (sum == 0)
		return 0;
	__int64 val = sum * taxval * 2;
	val = val / (10000 + taxval);
	__int64 tax = (val + 1) / 2;
	return (long) tax;
}

static long _subtractTax(long sum, long taxval) {
	return sum - _calcTax(sum, taxval);
}

// virtual 
JsonObject CFiscalPrinter_IkcBase::FillZReportInfo()
{
	JsonObject result;

	TraceINFO(L"DATECS [%s]. FillZReportInfo()", _id.c_str());
	DAYREPORT_INFO_0 info = { 0 };
	DayReport_(&info);
	long cashin = info.GetCashIn();
	long cashout = info.GetCashOut();
	long saleTax0 = info.SaleTax(0);
	long saleTax1 = info.SaleTax(1);
	long saleTax2 = info.SaleTax(2);
	long saleTax3 = info.SaleTax(3);

	long sumCard = info.SalePayment(0);
	long sumCash = info.SalePayment(3);

	long retTax0 = info.RetTax(0);
	long retTax1 = info.RetTax(1);
	long retTax2 = info.RetTax(2);
	long retTax3 = info.RetTax(3);

	long retCard = info.RetPayment(0);
	long retCash = info.RetPayment(3);


	JsonObject payments;
	for (auto it = _taxChars.begin(); it != _taxChars.end(); ++it) {
		long taxNo = it->second - 0x80;
		long sum = info.SaleTax(taxNo);
		long ret = info.RetTax(taxNo);

		TAX_KEY taxKey;
		taxKey.key = it->first;

		if (sum || ret) {
			JsonObject taxObj;

			// calc vat from sum and return values

			//taxObj.Add(L"taxSum", tax.value1);
			//taxObj.Add(L"taxReturn", tax.value2);
			taxObj.Add(L"tax", taxKey.tax);
			if (taxKey.nested) {
				//auto nestedKey = FindTaxKey(taxKey.nested + L'0');
				taxObj.Add(L"nested", taxKey.nested);
				JsonObject nestedObj;
				nestedObj.Add(L"tax", taxKey.nested);
				nestedObj.Add(L"sum", __currency::from_units(sum));
				nestedObj.Add(L"return", __currency::from_units(ret));
				nestedObj.Add(L"taxSum", __currency::from_units(_calcTax(sum, taxKey.nested)));
				nestedObj.Add(L"taxReturn", __currency::from_units(_calcTax(ret, taxKey.nested)));
				payments.AddArray(&nestedObj);

				long restSum = _subtractTax(sum, taxKey.nested);
				long restRet = _subtractTax(ret, taxKey.nested);

				taxObj.Add(L"sum", __currency::from_units(restSum));
				taxObj.Add(L"return", __currency::from_units(restRet));

				taxObj.Add(L"taxSum", __currency::from_units(_calcTax(restSum, taxKey.tax)));
				taxObj.Add(L"taxReturn", __currency::from_units(_calcTax(restRet, taxKey.tax)));
			}
			else if (taxKey.tax) {
				taxObj.Add(L"sum", __currency::from_units(sum));
				taxObj.Add(L"return", __currency::from_units(ret));
				taxObj.Add(L"taxSum", __currency::from_units(_calcTax(sum, taxKey.tax)));
				taxObj.Add(L"taxReturn", __currency::from_units(_calcTax(ret, taxKey.tax)));
			}

			payments.AddArray(&taxObj);
		}
	}

	result.AddArray(L"sums", &payments);

	JsonObject cash;
	cash.Add(L"payment", __currency::from_units(sumCash));
	cash.Add(L"return", __currency::from_units(retCash));
	result.Add(L"cash", &cash);

	JsonObject card;
	card.Add(L"payment", __currency::from_units(sumCard));
	card.Add(L"return", __currency::from_units(retCard));
	result.Add(L"card", &card);

	DAYREPORT_INFO_TAG_0 info_0 = { 0 };
	DayReport_Tag(&info_0, 0, sizeof(DAYREPORT_INFO_TAG_0));

	//DAYREPORT_INFO_TAG_1 info_1 = { 0 }; только для НАЛОЖЕННОГО НДС
	//DayReport_Tag(&info_1, 1, sizeof(DAYREPORT_INFO_TAG_1));

	int coins = GetCash_();

	result.Add(L"zno", info_0.zrepno);
	result.Add(L"cashOnHand", __currency::from_units(coins));

	return result;
}
