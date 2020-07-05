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

#define IDP_FP_ERROR L"ќшибка фискального регистратора"


#define MESSAGE_LENGTH 20

CFiscalPrinter_IkcBase::CFiscalPrinter_IkcBase()
	: m_hCom(INVALID_HANDLE_VALUE),
	m_nSeq(1), m_lastArt(0), m_nLastReceiptNo(0), m_bReturnCheck(false),
	m_bytesToSend(0), m_RcvDataLen(0), m_LastDataLen(0),
	m_dwReserved(0), m_dwStatus(0), m_dwError(0), m_dwOsError(0), m_bEndOfTape(false),
	m_sndBytes(0), m_rcvBytes(0)
{
	memset(m_sndBuffer, 0, sizeof(m_sndBuffer));
	memset(m_rcvBuffer, 0, sizeof(m_rcvBuffer));
	memset(m_status, 0, sizeof(m_status));
	memset(m_data, 0, sizeof(m_data));
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

	// Get status (with buffer print)

	DisplayDateTime(); // customer display

	// TODO:
	m_nLastZReportNo = 0;  // GetPrinterLastZReportNo();
	m_nLastReceiptNo = 0; // GetPrinterLastReceiptNo(); // for status processing
	if (m_nLastZReportNo) {
		time_t time = std::time(0);
		tm tm;
		localtime_s(&tm, &time);
		m_nLastZReportNo = tm.tm_year * 10000 + tm.tm_hour * 100 + tm.tm_mday;
	}

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


void CFiscalPrinter_IkcBase::CreateCommand(FP_COMMAND cmd, BYTE* pData /*= NULL*/, int DataLen /*= 0*/)
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
	//throw EQUIPException(FPGetLastError());
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
	CreateCommand(FP_GET_CASH);
	SendCommand();
	BYTE Data[5] = { 0 }; // сумма в копейках
	GetData(Data, 5);
	_ASSERT(Data[4] == 0);  // no data
	_ASSERT(Data[3] < 128); // less then
	int x = Data[3] * 16777216 + Data[2] * 65536 + Data[1] * 256 + Data[0];
	return x;
}

void CFiscalPrinter_IkcBase::GetData(BYTE* pData, int DataLen)
{
	if (DataLen > m_RcvDataLen)
		ThrowCommonError();
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
		CreateCommand(cmd, (BYTE*)sum, 4);
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
	}
	void SetName(LPCTSTR szText, long art, __int64 vtId)
	{
		len = CFiscalPrinter_IkcBase::ConvertText(szText, (LPSTR)name, 76, 75);
		code[0] = LOBYTE(LOWORD(art));
		code[1] = HIBYTE(LOWORD(art));
		code[2] = LOBYTE(HIWORD(art));
		code[3] = HIBYTE(HIWORD(art));
		code[4] = 0;
		code[5] = 0;
		// перенесем код в наименование
		for (int i = 0; i < 6; i++)
			name[i + len] = code[i];
		tax = 0x80; // A
		if (vtId != 2)
			tax = 0x81;
	}
	void SetTax(int nTax)
	{
		if (nTax != -1)
			tax = 0x80 + nTax;
	}
	int GetLength()
	{
		return 3 + 1 + 4 + 1 + 1 + len + 6;
	}

	void SetQtyPrice(int sqty, int sprice)
	{
		status = 0x3; // 3 цифры после точки
		price[0] = LOBYTE(LOWORD(sprice));
		price[1] = HIBYTE(LOWORD(sprice));
		price[2] = LOBYTE(HIWORD(sprice));
		price[3] = HIBYTE(HIWORD(sprice));

		qty[0] = LOBYTE(LOWORD(sqty));
		qty[1] = HIBYTE(LOWORD(sqty));
		qty[2] = LOBYTE(HIWORD(sqty));

		//CString str;
		//str.Format(L"%02x%02x%02x%02x", status, qty[0], qty[1], qty[2], qty[3]);
		//CAppData::TraceINFO(TRACE_CAT_GNR, NULL, (const wchar_t*)str);
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
		op = cmd; // 0 или 3 - % скидка на последний товар/подытог
		value = (DWORD)prc;
		value |= 0x04000000; // пор€док + 2
		if (prc > 0)
			value |= 0x80000000; // бит 31 - скидка
	}
	void SetSum(int sum, BYTE cmd)
	{
		op = cmd; // 2 или 4 - сумма скидки на последний товар/подытог
		value = (DWORD)sum;
		if (sum > 0)
			value |= 0x80000000; // бит 31 - скидка
	}
	void SetName(const wchar_t* szText)
	{
		len = CFiscalPrinter_IkcBase::ConvertText(szText, (LPSTR)name, 25, 25);
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
	BYTE string[21];

	DISPLAY_INFO()
	{
		memset(this, 0, sizeof(DISPLAY_INFO));
	}

	void SetName(const wchar_t* szText)
	{
		len = CFiscalPrinter_IkcBase::ConvertText(szText, (LPSTR)string, 21, 20);
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
	/*
	void SetDateFrom(const COleDateTime dt)
	{
		int y = dt.GetYear() - 2000;
		int m = dt.GetMonth();
		int d = dt.GetDay();
		from[0] = ((d / 10) << 4) + (d % 10);  // day
		from[1] = ((m / 10) << 4) + (m % 10);
		from[2] = ((y / 10) << 4) + (y % 10);
	}
	void SetDateTo(const COleDateTime dt)
	{
		int y = dt.GetYear() - 2000;
		int m = dt.GetMonth();
		int d = dt.GetDay();
		to[0] = ((d / 10) << 4) + (d % 10);  // day
		to[1] = ((m / 10) << 4) + (m % 10);
		to[2] = ((y / 10) << 4) + (y % 10);
	}
	*/
};

#pragma pack(pop)

// virtual 
void CFiscalPrinter_IkcBase::SetParams(const PosConnectParams& prms)
{
}

// static 
int CFiscalPrinter_IkcBase::ConvertText(const wchar_t* szText, char* text, int bufSize, int maxSize)
{
	/*
	CString strText(szText);
	if (strText.GetLength() > maxSize)
	{
		CString x = strText.Left(maxSize);
		strText = x;
	}

	strText.Replace(L"≤", L"I");
	strText.Replace(L"≥", L"i");
	return ::WideCharToMultiByte(866 /* UA * /,
		0,
		(const wchar_t*)strText, strText.GetLength(),
		text, bufSize,
		nullptr, nullptr);
		*/
			return 0;
}



void CFiscalPrinter_IkcBase::Comment(const wchar_t* szComment, int maxSize)
{
	COMMENT_INFO ci = { 0 };
	ci.len = ConvertText(szComment, ci.Text, 255, maxSize);
	CreateCommand(FP_COMMENT, (BYTE*)&ci, ci.len + 1);
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

}

// virtual 
void CFiscalPrinter_IkcBase::AddArticle(const RECEIPT_ITEM& item)
{

}

// virtual 
void CFiscalPrinter_IkcBase::Payment(PAYMENT_MODE mode, long sum)
{
}

//
void CFiscalPrinter_IkcBase::Payment(LONG Sum, PAY_TYPE pt, bool bAutoClose)
{
	IKC_PAYMENT_INFO pi = { 0 };
	pi.Payment = Sum;
	pi.SetPaymentType(pt);
	pi.SetAutoClose(bAutoClose);
	CreateCommand(FP_PAYMENT, (BYTE*) &pi, 7);
	SendCommand();
}

// virtual 
void CFiscalPrinter_IkcBase::OpenCashDrawer()
{
	CreateCommand(FP_CASH_DRAWER);
	SendCommand();
}

// virtual 
long CFiscalPrinter_IkcBase::NullReceipt(bool bOpenCashDrawer)
{
	TraceINFO(L"IKSBASE [%s]. NullReceipt({openCashDrawer=%s})", _id.c_str(), bOpenCashDrawer ? L"true" : L"false");
	CreateCommand(FP_RESET_ORDER);
	SendCommand();
	Comment(L"Ќ”Ћ№ќ¬»… „≈ ", 27);
	Payment(0, FP_PAYTYPE_CASH, true);
	CheckPaperStatus();
	//GetLastCheckNo(0, true); // получим ID чека
	return m_nLastReceiptNo;
}


// virtual
void CFiscalPrinter_IkcBase::CheckPaperStatus()
{
}

// virtual
long CFiscalPrinter_IkcBase::CopyReceipt()
{
	CreateCommand(FP_PRINTCOPY);
	SendCommand();
	return m_nLastReceiptNo;
}

// virtual 
bool CFiscalPrinter_IkcBase::PrintDiagnostic()
{
	try {
		CreateCommand(FP_PRINTVER);
		SendCommand();
	}
	catch (EQUIPException e) {
		//e.ReportError2();
		return false;
	}
	return true;
}


/*
// virtual 
bool CFiscalPrinter_IkcBase::PrintCheckItem(const CFPCheckItemInfo& info)
{
	try
	{
		//int code = GetPrintCodeByArticle(info.m_art, info.m_name);
		// ATT:: DB_ID 2 LONG
		PrintItem(info.m_name, (LONG)info.m_art, info.m_iQty, info.m_fQty, info.m_price, info.m_dscPercent, info.m_dscSum, info.m_vtid, info.m_nTaxGroup);
	}
	catch (EQUIPException e)
	{
		m_strError = e.GetError(); // без сообщени€
		return false;
	}
	return true;
}
*/

void CFiscalPrinter_IkcBase::PrintItem(const wchar_t* szName, long code, int /*iQty*/, double fQty, int price, int dscPrc, int dscSum, __int64 vtid, int nTax)
{
	/*
	code*8 = normal
	code*8+1 = return;
	*/
	code = code * 8;
	FP_COMMAND fpcmd = FP_SALE_ITEM;
	if (m_bReturnCheck) {
		fpcmd = FP_RETURN_ITEM;
		code++;
	}
	SALE_INFO si;
	si.SetName(szName, code, vtid);
	//LONG lQty = (LONG)(CDoubleT::Round(fQty, 3) * 1000.0);

	//CString msg;
	//msg.Format(L"fQty=%f, lQty=%ld", fQty, lQty);

	//CAppData::TraceINFO(TRACE_CAT_GNR, NULL, msg);

	//si.SetQtyPrice(lQty, price);
	si.SetTax(nTax);
	CreateCommand(fpcmd, (BYTE*)&si, si.GetLength());
	SendCommand();
	/*use discount here*/
	if ((dscPrc != 0) || (dscSum != 0))
	{
	}
}

// virtual 
bool CFiscalPrinter_IkcBase::CancelCheckCommand()
{
	bool bClosed = false;
	return CancelCheck(bClosed);
}

// virtual 
bool CFiscalPrinter_IkcBase::CancelCheck(bool& bClosed)
{
	try
	{
		bClosed = false;
		CreateCommand(FP_RESET_ORDER);
		SendCommand();
	}
	catch (EQUIPException e)
	{
		m_strError = e.GetError(); // без сообщени€
		return false;
	}
	return true;
}

// virtual 
void CFiscalPrinter_IkcBase::DisplayRow(int nRow, LPCTSTR szString)
{
	m_bReturnCheck = false;
	try
	{
		DISPLAY_INFO di;
		if (nRow != 0)
			di.row = 1;
		di.SetName(szString);
		CreateCommand(FP_DISPLAY_ROW, (BYTE*)&di, di.GetLength());
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
	CreateCommand(FP_RESET_ORDER);
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
	return m_nLastReceiptNo;
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
	CreateCommand(FP_RESET_ORDER);
	SendCommand();
	COMMENT_INFO ci = { 0 };
	ci.len = ConvertText(L"¬»ƒј“ ќ¬»… „≈ ", ci.Text, 255, 27);
	ci.len |= 0x80; // high bit - return receipt
	CreateCommand(FP_COMMENT, (BYTE*)&ci, ci.len + 1);
	SendCommand();
	m_bReturnCheck = true;
}

// virtual 
long CFiscalPrinter_IkcBase::XReport()
{
	REPPWD_INFO pi;
	CreateCommand(FP_XREPORT, (BYTE*)&pi, 2);
	SendCommand();
	// last receipt no
	//GetLastCheckNo();
	return m_nLastReceiptNo;
}

// virtual 
ZREPORT_RESULT CFiscalPrinter_IkcBase::ZReport()
{
	REPPWD_INFO pi;
	CreateCommand(FP_ZREPORT, (BYTE*)&pi, 2);
	SendCommand();
	ZREPORT_RESULT result;
	throw EQUIPException(L"yet not implemented");
	//result.no = 1;
	//result.zno = 1;
	//return result;
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
		CreateCommand(FP_PREP_NO_F, (BYTE*)&rni, sizeof(REPNO_INFO));
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
		CreateCommand(FP_REP_ART, (BYTE*)&rpi, sizeof(REPPWD_INFO));
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
		CreateCommand(FP_DISCOUNT, (BYTE*)&di, 6 + di.len);
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
	DisplayRow(0, L"");
	DisplayRow(1, L"");
}

// virtual 
void CFiscalPrinter_IkcBase::DisplayDateTime()
{
	//throw EQUIPException(L"Yet not implemented");
}

// virtual 
void CFiscalPrinter_IkcBase::GetStatusMessages(std::vector<std::wstring>& msgs)
{
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
	//json.Add(L"model", _model.c_str());
	json.Add(L"port", _port.c_str());
	json.Add(L"zno", m_nLastZReportNo);
	json.Add(L"version", POS_MODULE_VERSION());
}



