// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "equipmentbase.h"
#include "fiscalprinter.h"
#include "fiscalprinterimpl.h"
#include "fp_DatecsBase.h"
#include "fp_DatecsKrypton.h"
#include "stringtools.h"
#include "errors.h"

#define MAX_COMMAND_LEN 255
#define MAX_NAME_LEN    75
#define MAX_UNIT_LEN    6

enum FP_COMMANDS {
	FPCMD_SETDATETIME = 0x20,
	FPCMD_GETDATETIME = 0x21,
	FPCMD_ADDARTICLE = 0x24,
	PFCMD_FINDARTICLE = 0x25,
	PFCMD_GETPAYMODE = 0x2e,
	FPCMD_GETTAXRATE = 0x48,
	FPCMD_OPENNONFISCAL = 0x60,
	FPCMD_PRINTTEXT = 0x61,
	FPCMD_OPENFISCAL = 0x63,
	FPCMD_PRINTITEM = 0x64,
	FPCMD_DISCOUNTPRCNT = 0x68,
	FPCMD_DISCOUNTABS = 0x69,
	FPCMD_CLOSEFISCAL = 0x65,
	FPCMD_PAYMENT = 0x67,
	FPCMD_PRINTTOTAL = 0x6d,
	FPCMD_CANCELRECEIPT = 0x6b,
	FPCMD_GETMODEMSTATE = 0x6c,
	FPCMD_SVCINOUT = 0x6e,
	FPCMD_DISPLAY = 0x81,
	FPCMD_BEEP = 0x82,
	FPCMD_CASHDRAWER = 0x83,
	FPCMD_PRINTDIAG = 0x84,
	FPCMD_DAYREPORTS = 0xa1,
	FPCMD_DATEREPORTS = 0xa2,
	FPCMD_NUMREPORTS = 0xa3,
	FPCMD_ARTICLEREPORT = 0xa4,
	FPCMD_PRINTCOPY = 0xa5,
	FPCMD_DAYSUMS = 0xe0,
	FPCMD_GETFISCTRANS = 0xe1,
	FPCMD_DAYCOUNTERS = 0xe2,
	FPCMD_MODEMSTATEREP = 0xea,
};

enum {
	FPS0_SERVICE_MODE   = 0x01, // 0
	FPS0_BUFFER_OVER    = 0x02, // 1
	FPS0_NO_FAILURE     = 0x04, // 2
	FPS0_NO_DISPLAY     = 0x08, // 3
	FPS0_PRINTER_NOTRDY = 0x10, // 4
	FPS0_NEED_RESET     = 0x20, // 5
	FPS0_OTHER_HW_ERROR = 0x40, // 6

	FPS1_RCP_TAPE_ENDING = 0x01,  // 0
	FPS1_CTL_TAPE_ENDING = 0x02,  // 1
	FPS1_RCP_TAPE_ENDED  = 0x04,  // 2
	FPS1_CTL_TAPE_ENDED  = 0x08,  // 3
	FPS1_COVER_OPENED    = 0x10,  // 4 
	FPS1_PAPER_SKIPPING  = 0x20,  // 5
	FPS1_BUFFER_NOTEMPTY = 0x40,  // 6

	FPS2_CHECK_STATE     = 0x0F, // CHECK_STATUS (0..3)
	FPS2_RETCHECK_OPENED = 0x10, // 4

	FPS3_SECURITY_ERROR = 0x01, // 0
	FPS3_SIM_ERROR      = 0x02, // 1
};

#define EMPTY_PARAM L"000000;"


__int64 makeCode(__int64 art, __currency price) {
	return (art % 10000000) * 10000000 + price.units();
}

CFiscalPrinter_DatecsKrypton::CFiscalPrinter_DatecsKrypton(const wchar_t* model)
	: CFiscalPrinter_DatecsBase(), m_nLastReceiptNo(0), m_nLastZReportNo(0)
{
	_model = model;
	// default values. 
	_payModeCash = L'0';
	_payModeCard = L'1';
	_op = 1; // TODO: operator
	_tno = 1; // TODO: terminal
	_testReceiptNo = 123;
}


// virtual 
void CFiscalPrinter_DatecsKrypton::PrintDiagnostic()
{
	CreateCommand(L"OPENNONFISCAL", FPCMD_OPENNONFISCAL, EMPTY_PARAM);
	SendCommand();

	CreateCommand(L"PRINTDIAG", FPCMD_PRINTDIAG, L"000000;0;"); /*0 - tech info*/
	SendCommand();

	CreateCommand(L"CLOSEFISCAL", FPCMD_CLOSEFISCAL, L"000000;0;");
	SendCommand();
}

// virtual 
bool CFiscalPrinter_DatecsKrypton::PeriodicalByNo(BOOL Short, LONG From, LONG To)
{
	/*
	CString info;
	try
	{
		CreateCommand(FPCMD_OPENNONFISCAL, EMPTY_PARAM);
		SendCommand();

		CString s;
		s.Format(L"%s%04d;%04d;%s;", EMPTY_PARAM, From, To,
			Short ? L"0" : L"1");
		CreateCommand(FPCMD_NUMREPORTS, s);
		SendCommand();

		CreateCommand(FPCMD_CLOSEFISCAL, L"000000;0;");
		SendCommand();
		GetPrinterLastCheckNo(m_nLastCheckNo, true); // получим ID чека
	}
	catch (EQUIPException ex)
	{
		ex.ReportError2();
		return false;
	}
	*/
	return true;
}

// virtual 
/*
bool CFiscalPrinter_DatecsKrypton::PeriodicalByDate(BOOL Short, COleDateTime From, COleDateTime To)
{
	CString info;
	try
	{
		CreateCommand(FPCMD_OPENNONFISCAL, EMPTY_PARAM);
		SendCommand();

		CString s;
		s.Format(L"%s%02d%02d%02d;%02d%02d%02d;%s;", EMPTY_PARAM,
			From.GetDay(), From.GetMonth(), From.GetYear() - 2000,
			To.GetDay(), To.GetMonth(), To.GetYear() - 2000,
			Short ? L"0" : L"1");
		CreateCommand(FPCMD_DATEREPORTS, s);
		SendCommand();

		CreateCommand(FPCMD_CLOSEFISCAL, L"000000;0;");
		SendCommand();
		GetPrinterLastCheckNo(m_nLastCheckNo, true); // получим ID чека
	}
	catch (EQUIPException ex)
	{
		ex.ReportError2();
		return false;
	}
	return true;
}
*/

// virtual 
bool CFiscalPrinter_DatecsKrypton::ReportByArticles()
{
	try
	{
		CreateCommand(L"OPENNONFISCAL", FPCMD_OPENNONFISCAL, EMPTY_PARAM);
		SendCommand();
		
		CreateCommandV(L"ARTICLEREPORT", FPCMD_ARTICLEREPORT, L"%s%s", EMPTY_PARAM, L"0;999999;");
		SendCommand();

		CreateCommand(L"CLOSEFISCAL", FPCMD_CLOSEFISCAL, L"000000;0;");
		SendCommand();
		m_nLastReceiptNo = GetPrinterLastReceiptNo(); // get receipt id
	}
	catch (EQUIPException ex)
	{
		m_strError = ex.GetError();
		return false;
	}
	return true;
}

// virtual 
bool CFiscalPrinter_DatecsKrypton::ReportModemState()
{
	// print without service document!
	CreateCommandV(L"MODEMSTATEREP", FPCMD_MODEMSTATEREP, L"%s%s", EMPTY_PARAM, L"1;"); //1 - print report;
	SendCommand();
	m_nLastReceiptNo = GetPrinterLastReceiptNo(); // get receipt ID
	return true;
}

// virtual 
bool CFiscalPrinter_DatecsKrypton::ProgramOperator(LPCWSTR Name, LPCWSTR Password)
{
	return true;
}

// virtual 
void CFiscalPrinter_DatecsKrypton::Beep()
{
	try
	{
		CreateCommand(L"FPCMD_BEEP", FPCMD_BEEP, L"000000;2;"); /*1-KEY;2-OK;3-WARN;4-ERROR*/
		SendCommand();
	}
	catch (EQUIPException /*ex*/)
	{
		// do not show error
	}
}

// virtual 
long CFiscalPrinter_DatecsKrypton::NullReceipt(bool bOpenCashDrawer)
{
	CancelOrCloseReceipt();

	TraceINFO(L"DATECS [%s]. NullReceipt({openCashDrawer=%s})", _id.c_str(), bOpenCashDrawer ? L"true" : L"false");
	int tno = 1;
	CreateCommandV(L"OPENFISCAL", FPCMD_OPENFISCAL, L"%s%02d;%01d;0;", EMPTY_PARAM, _op, tno);
	SendCommand();

	// print total
	CreateCommand(L"PRINTTOTAL", FPCMD_PRINTTOTAL, L"000000;0;");
	SendCommand();

	// payment = 0
	CreateCommand(L"PAYMENT", FPCMD_PAYMENT, L"000000;0;0.00;");
	SendCommand();

	m_nLastReceiptNo = CloseFiscal(true);

	if (bOpenCashDrawer)
	{
		CreateCommand(L"CASHDRAWER", FPCMD_CASHDRAWER, EMPTY_PARAM);
		SendCommand();
	}
	return m_nLastReceiptNo;
}

/*
	Payment form mask
		bit 0. allowed to sell receipt
		bit 1. allowed to return receipt
		bit 7. cash change allowed
*/
// virtual 
void CFiscalPrinter_DatecsKrypton::SetParams(const PosConnectParams& prms)
{
	/*
	TraceINFO(L"DATECS [%s]. SetParams({payModes:'%s', taxModes:'%s'})",
		_id.c_str(), prms.payModes, prms.taxModes);
	if (prms.payModes && *prms.payModes) {
		std::wstring wpayModes = prms.payModes;
		auto payModes = _wsplit(wpayModes, L',');
		if (payModes.size() < 2)
			throw EQUIPException(FP_E_INVALID_PAYMODES);
		_payModeCash = payModes.at(0).at(0);
		_payModeCard = payModes.at(1).at(0);
	}

	if (prms.taxModes && *prms.taxModes) {
		std::wstring wtaxModes = prms.taxModes;
		auto taxModes = _wsplit(wtaxModes, L',');
		// 20, 7, 0, [EXCISE]
		if (taxModes.size() < 2)
			throw EQUIPException(FP_E_INVALID_TAXMODES);
	}
	*/
}


void CFiscalPrinter_DatecsKrypton::GetPrinterPayModes()
{
	TraceINFO(L"DATECS [%s]. GetPaymentModes()", _id.c_str());
	bool bCashSet = false;
	bool bCardSet = false;
	DWORD dwCardFlags = 0;

	/* pay mode flag bits
		0. sale allowed
		1. refund allowed
		7. cash withdrawal allowed
	*/

	for (int i = 0; i < 9; i++)
	{
		CreateCommandV(L"GETPAYMODE", PFCMD_GETPAYMODE, L"000000;%d;", i);
		SendCommand();
		// 000;xxxx;NAME;
		std::string  info((char*)m_data);

		if (IS_EMULATION()) {
			if (i == 0)
				info = "RCV:0000;83;Готівка;";
			else if (i == 1)
				info = "RCV:0000;03;КАРТКА;";
		}


		TraceINFO(L"\t\tRCV:%s", A2W(info.c_str()).c_str());
		auto items = _split(info, ';');
		if (items.size() > 2) {
			std::string payName = items[2];
			toUpperUA(payName);
			std::string xxx("готівка картка");
			toUpperUA(xxx);
			if (payName == "ГОТІВКА" || payName == "НАЛИЧНЫЕ" || payName == "ГРОШІ") {
				_payModeCash = L'0' + i;
				bCashSet = true;
			}
			else if (payName == "КАРТКА" || payName == "КАРТА" || payName == "КАРТОЧКА") {
				_payModeCard = L'0' + i;
				std::string flags = items[1];
				unsigned int val = 0;
				if (sscanf_s(flags.c_str(), "%02x", &val) == 1)
					dwCardFlags = (DWORD)val;
				bCardSet = true;
			}
			if (bCashSet && bCardSet)
				break;
		}
	}
	// TODO: LOCALIZE MESSAGES
	if (!bCardSet)
		throw EQUIPException(L"Фіскальний реєстратор.\nНе знайдено форму оплати КАРТКА (КАРТОЧКА, КАРТА).\nПерепрограмуйте реєстратор.");

	if ((dwCardFlags & 0x02) == 0)
		throw EQUIPException(L"Фіскальний реєстратор.\nДля форми оплати КАРТКА заборонені повернення.\nПерепрограмуйте реєстратор.");

	TraceINFO(L"  Pay mode cash. char: %C", _payModeCash);
	TraceINFO(L"  Pay mode card. char: %C", _payModeCard);
}

void CFiscalPrinter_DatecsKrypton::GetTaxRates()
{
	TraceINFO(L"DATECS [%s]. GetTaxRates()", _id.c_str());
	for (int i = 0; i < 5; i++)
	{
		CreateCommandV(L"GETTAXRATE", FPCMD_GETTAXRATE, L"000000;%d;", i);
		SendCommand();
		std::string info((char*)m_data);
		TraceINFO(L"\t\tRCV:%s", A2W(info.c_str()).c_str());
		auto elems = _split(info, ';');
		if (elems.size() > 4) 
		{
			std::string vatPercent = elems[2];
			long nested = atol(elems[4].c_str());
			TAX_KEY taxKey;
			taxKey.tax = (long)std::round(atof(vatPercent.c_str()) * 100.0);
			taxKey.nested = nested;
			long taxIndex = (long) std::round(atof(vatPercent.c_str()) * 100.0);
			if (_taxChars.count(taxKey.key) == 0)
				_taxChars[taxKey.key] = L'0' + i;
		}
	}
	if (IS_EMULATION()) {
		TAX_KEY key;
		key.tax = 0;
		key.nested = -1;
		if (_taxChars.count(key.key) == 0)
			_taxChars[key.key] = L'0'; // 20%

		key.tax = 0;
		key.nested = -1;
		if (_taxChars.count(key.key) == 0)
			_taxChars[key.key] = L'1'; // 5% (not used)

		key.tax = 0;
		key.nested = -1;
		if (_taxChars.count(key.key) == 0)
			_taxChars[key.key] = L'2'; // 20% + 5%

		key.tax = 0;
		key.nested = -1;
		if (_taxChars.count(key.key) == 0)
			_taxChars[key.key] = L'3'; // 20% + 5%

		key.tax = 0;
		key.nested = -1;
		if (_taxChars.count(key.key) == 0)
			_taxChars[key.key] = L'4'; // 0%
	}

	TAX_KEY key;
	for (auto it = _taxChars.begin(); it != _taxChars.end(); ++it) {
		key.key = it->first;
		wchar_t ch = it->second;
		TraceINFO(L"  Tax mode: char: '%C', tax: %ld, nested:%ld", ch, key.tax, key.nested);
	}

}

TAX_KEY CFiscalPrinter_DatecsKrypton::FindTaxKey(wchar_t tax)
{
	TAX_KEY taxKey;
	taxKey.key = 0;
	for (auto it = _taxChars.begin(); it != _taxChars.end(); ++it) {
		if (it->second == tax) {
			taxKey.key = it->first;
			return taxKey;
		}
	}
	return taxKey;
}

wchar_t CFiscalPrinter_DatecsKrypton::FindTaxChar(long tax, long excise)
{
	TAX_KEY key;
	key.tax = tax;
	key.nested = -1;
	// without excise
	const wchar_t taxCode = _taxChars[key.key];
	if (!excise)
		return taxCode;
	// find nested tax
	TAX_KEY exciseKey;
	exciseKey.tax = excise;
	exciseKey.nested = -1;
	const wchar_t exciseCode = _taxChars[exciseKey.key];
	// nested tax (excise)
	key.nested = exciseCode - L'0';
	return _taxChars[key.key];
}


// virtual 
void CFiscalPrinter_DatecsKrypton::Init()
{
	TraceINFO(L"DATECS [%s]. Init()", _id.c_str());

	// Get status (with buffer print)

	GetPrinterPayModes();
	GetTaxRates();
	DisplayDateTime(); // customer display

	m_nLastZReportNo = GetPrinterLastZReportNo();
	m_nLastReceiptNo = GetPrinterLastReceiptNo(); // for status processing

	// last article
	RECEIPT_STATUS cs = GetReceiptStatus();
	if (cs == CHS_NORMAL)
	{
		// CheckPrinterSession(); 24 часа Z-отчета?
		//TODO::CHECK_INFO::TestFix(termId, m_nLastCheckNo);
		return;
	}

	CancelOrCloseReceipt();
	m_nLastReceiptNo = GetPrinterLastReceiptNo(); // again
	// CheckPrinterSession(); 24 часа Z-отчета?
	//TODO::CHECK_INFO::TestFix(termId, m_nLastCheckNo);
	TraceINFO(L"  Pay mode cash. char: %C", _payModeCash);
	TraceINFO(L"  Pay mode card. char: %C", _payModeCard);
}

// virtual 
long CFiscalPrinter_DatecsKrypton::CopyReceipt()
{
	long rcpNo = -1;
	CreateCommand(L"DAYCOUNTERS", FPCMD_DAYCOUNTERS, L"000000;5;"); // last available receipt for copy
	SendCommand();
	std::string info((char*)m_data);
	TraceINFO(L"\t\tRCV:%s", A2W(info.c_str()).c_str());


	// 00000;RCP_NO;
	auto sinfo = _split(info, ';');
	if (sinfo.size() < 2)
		throw EQUIPException(FP_E_DATA_ERROR);
	std::string r = sinfo[1];
	rcpNo = atol(r.c_str());
	if (rcpNo == -1)
		return -1; // no receipts available
	CreateCommand(L"OPENNONFISCAL", FPCMD_OPENNONFISCAL, EMPTY_PARAM);
	SendCommand();
	CreateCommandV(L"PRINTCOPY", FPCMD_PRINTCOPY, L"%s%ld;%ld;", EMPTY_PARAM, rcpNo, rcpNo);
	SendCommand();
	m_nLastReceiptNo = CloseFiscal(false);
	return m_nLastReceiptNo;
}

// virtual 
void CFiscalPrinter_DatecsKrypton::CheckStatus()
{
	//FPS1_RCP_TAPE_ENDING  = 0x01,  // 0
	//FPS1_CTL_TAPE_ENDING  = 0x02,  // 1
	//FPS1_RCP_TAPE_ENDED   = 0x04,  // 2
	//FPS1_CTL_TAPE_ENDED   = 0x08,  // 3

	if (m_status[1] & FPS1_RCP_TAPE_ENDED)
		m_bEndOfTape = true;
	if (m_status[1] & FPS1_CTL_TAPE_ENDED)
		m_bEndOfTape = true;
	if ((m_status[0] & FPS0_PRINTER_NOTRDY) != 0) {
		ThrowLastError();
	}
	else if (m_dwError != 0) {
		ThrowLastError();
	}
}

// virtual 
/*
bool CFiscalPrinter_DatecsKrypton::CancelReceiptCommand()
{
	RECEIPT_STATUS cs = GetReceiptStatus();
	/*
	CString s;
	try
	{
		if (cs == CHS_NORMAL) {
			s = L"Нет открытых чеков";
			if (m_bBigMsg)
				CMessageBox::DoMessageBox(s, NULL, MB_ICONHAND);
			else
				AfxMessageBox(s);
			return true;
		}
		else if (cs == CHS_NF_OPENED) {
			CreateCommand(FPCMD_CLOSEFISCAL, L"000000;0;");
			SendCommand();
			s = L"Печать чека завершена";
			if (m_bBigMsg)
				CMessageBox::DoMessageBox(s, NULL, MB_ICONHAND);
			else
				AfxMessageBox(s);
			return true;
		}
		CreateCommand(FPCMD_CANCELRECEIPT, L"000000;0;");
		SendCommand();
		s = L"Чек успешно аннулирован";
		if (m_bBigMsg)
			CMessageBox::DoMessageBox(s, NULL, MB_ICONHAND);
		else
			AfxMessageBox(s);
	}
	catch (EQUIPException ex) {
		ex.ReportError2();
		return false;
	}
	* /
	return true;
}
*/

void CFiscalPrinter_DatecsKrypton::CancelReceiptUnconditional()
{
	CreateCommand(L"CANCELRECEIPT", FPCMD_CANCELRECEIPT, L"000000;0;");
	SendCommand();
}

void CFiscalPrinter_DatecsKrypton::CancelOrCloseReceipt()
{
	RECEIPT_STATUS cs = GetReceiptStatus();
	if (cs == CHS_NORMAL)
		return;
	else if (cs == CHS_NF_OPENED)
	{
		CreateCommand(L"CLOSEFISCAL", FPCMD_CLOSEFISCAL, L"000000;0;");
		SendCommand();
	}
	else {
		CreateCommand(L"CANCELRECEIPT", FPCMD_CANCELRECEIPT, L"000000;0;");
		SendCommand();
	}
}

// virtual 
void CFiscalPrinter_DatecsKrypton::GetErrorCode()
{
	m_dwError = 0;
	char errCode[5];
	errCode[0] = m_rcvBuffer[4]; // char!
	errCode[1] = m_rcvBuffer[5];
	errCode[2] = m_rcvBuffer[6];
	errCode[3] = m_rcvBuffer[7];
	errCode[4] = '\0'; // char!
	DWORD dwError = strtol(errCode, nullptr, 16); // hex
	if (dwError != 0) {
		m_dwError = dwError;
	}
}

// virtual 
void CFiscalPrinter_DatecsKrypton::OpenReceipt()
{
	int tno = 1;

	CancelOrCloseReceipt();
	OpenFiscal(_op, L"", tno);
}

// virtual 
void CFiscalPrinter_DatecsKrypton::OpenReturnReceipt()
{
	int tno = 1;

	CancelOrCloseReceipt();
	OpenFiscalReturn(_op, L"", tno);
}

RECEIPT_STATUS CFiscalPrinter_DatecsKrypton::GetReceiptStatus()
{
	return (RECEIPT_STATUS)(m_status[2] & FPS2_CHECK_STATE);
}

// virtual 
void CFiscalPrinter_DatecsKrypton::SetCurrentTime()
{
	try
	{
		time_t time = std::time(nullptr);
		tm loctime = { 0 };
		localtime_s(&loctime, &time);
		CreateCommandV(L"SETDATETIME", FPCMD_SETDATETIME, L"%s%02d%02d%02d;%02d%02d;",
			EMPTY_PARAM, loctime.tm_mday, loctime.tm_mon + 1, loctime.tm_year + 1900 - 2000, 
			loctime.tm_hour, loctime.tm_min);
		SendCommand();
	}
	catch (EQUIPException ex)
	{
		m_strError = ex.GetError();
	}
}

// virtual 
void CFiscalPrinter_DatecsKrypton::DisplayDateTime()
{
}

// virtual 
void CFiscalPrinter_DatecsKrypton::DisplayClear()
{
	DisplayRow(0, L"", TEXT_ALIGN::_left);
	DisplayRow(1, L"", TEXT_ALIGN::_left);
}

// virtual 
void CFiscalPrinter_DatecsKrypton::DisplayRow(int nRow, LPCTSTR szString, TEXT_ALIGN align)
{
	/*
	CString txt(szString ? szString : EMPTYSTR);
	txt.Replace(L'\t', L' '); // tab is not supported
	txt += CString(L' ', 20);
	if (txt.GetLength() > 20)
		txt = txt.Left(20); // не более 20 символов
	int line = nRow > 1 ? 2 : 1;
	try
	{
		wchar_t buff[MAX_COMMAND_LEN];
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"%s%ld;00;%s;", EMPTY_PARAM, line, (LPCWSTR)txt);
		CreateCommand(FPCMD_DISPLAY, buff);
		SendCommand();
	}
	catch (EQUIPException ex)
	{
		// do nothing
		TraceERROR(L"DisplayRow exception (%s)", ex.GetError().c_str());
	}
	*/
}

// virtual 
/*
bool CFiscalPrinter_DatecsKrypton::GetCash(__int64 termId, COleCurrency& cy)
{
	CY sum;
	CY dummy;
	sum.int64 = 0I64;
	dummy.int64 = 0I64;
	try
	{
		GetDaySum(3, 0, sum, dummy);
		cy = sum;
	}
	catch (EQUIPException ex)
	{
		ex.ReportError2();
		return false;
	}
	return true;
}
*/

// virtual 
/*
LONG CFiscalPrinter_DatecsKrypton::GetCurrentZReportNo(bool bFromPrinter /*= false* /)
{
	if (bFromPrinter)
		m_nLastZReportNo = GetPrinterLastZReportNo();
	return m_nLastZReportNo;
}
*/

bool CFiscalPrinter_DatecsKrypton::CheckPaymentSum(int get)
{
	/*
	Защита от неправильных сумм по артикулам.
	Если полученная сумма меньше суммы по чеку, то принтер "зависнет"
	*/
	wchar_t buff[MAX_COMMAND_LEN];
	swprintf_s(buff, MAX_COMMAND_LEN - 1, L"%s3;1;", EMPTY_PARAM); // источник 3, значение  1 = сумма по чеку
	CreateCommand(L"GETFISCTRANS", FPCMD_GETFISCTRANS, buff);
	SendCommand();
	std::string info((char*)m_data);
	TraceINFO(L"\t\tRCV:%s", A2W(info.c_str()).c_str());
	/*
	// 0000;sum
	// sum - сумма по чеку (если она БОЛЬШЕ get, то ЗАПРЕТ оплаты и анулирование чека
	CString r;
	if (AfxExtractSubString(r, info, 1, L';'))
	{
		COleCurrency cy = CConvert::String2Currency(r);
		int sum = (long)cy.m_cur.int64 / 100;

		if (sum > get)
		{
			return false;
		}
	}
	*/
	return true;
}


// virtual 
void CFiscalPrinter_DatecsKrypton::PrintFiscalText(const wchar_t* szText)
{
	std::wstring text(szText);
	if (text.empty())
		return; // empty string, nothing to print

	std::replace(text.begin(), text.end(), L';', L','); // semicolon is divider!
	if (text.length() > MAX_NAME_LEN)
		text.resize(MAX_NAME_LEN);

	CreateCommandV(L"PRINTTEXT", FPCMD_PRINTTEXT, L"%s%s;", EMPTY_PARAM, text.c_str());
	SendCommand();
}

// virtual 
DWORD CFiscalPrinter_DatecsKrypton::GetFlags()
{
	return FiscalPrinterImpl::FP_SYNCTIME | FiscalPrinterImpl::FP_MODEMSTATE;
}

/*
bool CFiscalPrinter_DatecsKrypton::CloseCheck(int sum, int get, CFiscalPrinter::PAY_MODE pm, const wchar_t* szText /*= nullptr* /)
{
	USES_CONVERSION;
	try
	{
		if (!CheckPaymentSum(sum))
		{
			// отменяем ЧЕК
			CreateCommand(FPCMD_CANCELRECEIPT, L"000000;0;");
			SendCommand();
			throw EQUIPException(L"Внтутренняя ошибка фискального регистратора\nТекущий чек анулирован.\nОбратитесь к администратору системы.");
			return false;
		}
		CString payinfo;
		PrintTotal();
		WCHAR payMode = m_payModeCash;
		if (pm == CFiscalPrinter::_fpay_card)
			payMode = m_payModeCard;
		else if (pm == CFiscalPrinter::_fpay_credit)
			payMode = m_payModeCredit;
		Payment(payMode, get, payinfo);

		if (szText && *szText)
		{
			CString r;
			for (int i = 0; true; i++)
			{
				if (!AfxExtractSubString(r, szText, i, L'\n'))
					break;
				PrintFiscalText(r);
			}
		}

		CloseFiscal(m_nLastCheckNo);

		if (payMode == m_payModeCash)
		{
			CreateCommand(FPCMD_CASHDRAWER, EMPTY_PARAM);
			SendCommand();
		}

	}
	catch (EQUIPException e) {
		m_strError = e.GetError();
		return false;
	}
	return true;
}
*/

// virtual 
void CFiscalPrinter_DatecsKrypton::AddArticle(const RECEIPT_ITEM& item)
{
	__int64 code64 = makeCode(item.article, item.price);
	if (_mapCodes.count(code64) > 0)
		return;
	AddPrinterArticle(code64, item.name, item.unit, item.vat.units(), item.excise.units());
	_mapCodes[code64] = code64;
}

void CFiscalPrinter_DatecsKrypton::OpenFiscal(int opNo, LPCTSTR /*pwd*/, int tNo)
{
	CreateCommandV(L"OPENFISCAL", FPCMD_OPENFISCAL, L"%s%02d;%02d;0;", EMPTY_PARAM, opNo, tNo);
	SendCommand();
}

void CFiscalPrinter_DatecsKrypton::OpenFiscalReturn(int opNo, LPCTSTR /*pwd*/, int tNo)
{
	CreateCommandV(L"OPENFISCAL", FPCMD_OPENFISCAL, L"%s%02d;%02d;1;", EMPTY_PARAM, opNo, tNo);
	SendCommand();
}

DAY_SUM CFiscalPrinter_DatecsKrypton::GetDaySum(long src, long ix)
{
	DAY_SUM result;
	CreateCommandV(L"DAYSUMS", FPCMD_DAYSUMS, L"%s%ld;%ld;0;", EMPTY_PARAM, src, ix);
	SendCommand();
	std::string  info((char*)m_data);

	if (IS_EMULATION()) {
		if (src == 0 && ix == 0)
			info = "0000;280.50;-19.50;";
		else if (src == 1 && ix == 0)
			info = "0000;46.75;-3.25";
		else if (src == 0 && ix == 1)
			info = "0000;210.60;0.00";
		else if (src == 1 && ix == 1)
			info = "0000;10.03;0.00;";
		else if (src == 0 && ix == 2)
			info = "0000;200.57;0.00;";
		else if (src == 1 && ix == 2)
			info = "0000;33.43;0.00;";
		else if (src == 2 && ix == 0)
			info = "0000;491.10;-19.50;";
		//else if (src == 3 && ix == 0)
			//info = "0000;424.35;0.00"; // cashOnHand
		else
			info = "0000;0.00;0.00;";
	}

	TraceINFO(L"\t\tRCV:%s", A2W(info.c_str()).c_str());
	// XXXX;TURN;RET
	auto arr = _split(info, ';');
	long rcpNo = 0;
	if (arr.size() > 2) {
		result.value1 = __currency::from_string(arr[1]);
		result.value2 = __currency::from_string(arr[2]);
	}
	return result;
}

void CFiscalPrinter_DatecsKrypton::PrintTotal()
{
	CreateCommand(L"PRINTTOTAL", FPCMD_PRINTTOTAL, L"000000;0;");
	SendCommand();
	std::string  result((char*)m_data);
	TraceINFO(L"\t\tRCV:%s", A2W(result.c_str()).c_str());
}

// virtual 
void CFiscalPrinter_DatecsKrypton::Payment(PAYMENT_MODE mode, long sum)
{
	std::wstring info;
	switch (mode)
	{
	case PAYMENT_MODE::_pay_cash:
		Payment(_payModeCash, sum, info);
		break;
	case PAYMENT_MODE::_pay_card:
		Payment(_payModeCard, sum, info);
		break;
	}
};

// virtual 
long CFiscalPrinter_DatecsKrypton::CloseReceipt(bool bDisplay)
{
	return CloseFiscal(bDisplay);
}

void CFiscalPrinter_DatecsKrypton::Payment(WCHAR mode, int sum, std::wstring& info)
{
	int sum1 = sum / 100;
	int sum2 = sum % 100;
	CreateCommandV(L"PAYMENT", FPCMD_PAYMENT, L"%s%c;%d.%02d;", EMPTY_PARAM, mode, sum1, sum2);
	SendCommand();
	std::string  result((char*)m_data);
	TraceINFO(L"\t\tRCV:%s", A2W(result.c_str()).c_str());
}

long CFiscalPrinter_DatecsKrypton::CloseFiscal(bool bDisplay)
{
	CreateCommandV(L"CLOSEFISCAL", FPCMD_CLOSEFISCAL, L"%s%s;", EMPTY_PARAM, bDisplay ? L"1" : L"0");
	SendCommand();

	/*00000;<RECEIPT_NO>;*/
	std::string result((char*) m_data);

	if (IS_EMULATION())
		result = FormatString("0000;%ld;", _testReceiptNo++);

	TraceINFO(L"\t\tRCV:%s", A2W(result.c_str()).c_str());
	auto arr = _split(result, ';');
	long rcpNo = 0;
	if (arr.size() > 1) {
		rcpNo = atol(arr[1].c_str());
	}
	return rcpNo;
}

// virtual
long CFiscalPrinter_DatecsKrypton::XReport()
{
	TraceINFO(L"DATECS [%s]. XReport()", _id.c_str());
	CreateCommandV(L"DAYREPORTS", FPCMD_DAYREPORTS, L"%s1;", EMPTY_PARAM);
	SendCommand();
	m_nLastReceiptNo = GetPrinterLastReceiptNo();
	return m_nLastReceiptNo;
}


// virtual 
ZREPORT_RESULT CFiscalPrinter_DatecsKrypton::ZReport()
{
	TraceINFO(L"DATECS [%s]. ZReport()", _id.c_str());
	CreateCommandV(L"DAYREPORTS", FPCMD_DAYREPORTS, L"%s0;", EMPTY_PARAM);
	SendCommand();
	ZREPORT_RESULT result;
	m_nLastReceiptNo = GetPrinterLastReceiptNo(); // get receipt id
	m_nLastZReportNo = GetPrinterLastZReportNo();
	result.no = m_nLastReceiptNo;
	result.zno = m_nLastZReportNo;
	return result;
}

// virtual 
SERVICE_SUM_INFO CFiscalPrinter_DatecsKrypton::ServiceInOut(bool bOut, __currency sum, bool bOpenCashDrawer)
{
	TraceINFO(L"DATECS [%s]. ServiceInOut({out: %s, amount: %ld, openCashDrawer: %s})", _id.c_str(),
		bool2string(bOut), sum.units(), bool2string(bOpenCashDrawer)); 

	int op = 1; // %%%%%
	long sum_c = sum.units();

	if (bOut)
		CreateCommandV(L"SVCINOUT", FPCMD_SVCINOUT, L"%s%d;-%d.%02d;", EMPTY_PARAM, (int)op, (int)(sum_c / 100), (int)(sum_c % 100));
	else
		CreateCommandV(L"SVCINOUT", FPCMD_SVCINOUT, L"%s%d;%d.%02d;", EMPTY_PARAM, (int)op, (int)(sum_c / 100), (int)(sum_c % 100));

	SendCommand();
	std::string result((char*) m_data);

	if (IS_EMULATION()) {
		result = "000000;124.00;";
	}

	TraceINFO(L"\t\tRCV:%s", A2W(result.c_str()).c_str());
	auto elems = _split(result, ';');

	SERVICE_SUM_INFO info;
	info.sumOnHand = __currency::from_string(elems[1]);
	if (sum.int64 != 0)
		info.no = GetPrinterLastReceiptNo();

	if (bOpenCashDrawer) {
		CreateCommand(L"CASHDRAWER", FPCMD_CASHDRAWER, EMPTY_PARAM);
		SendCommand();
	}
	TraceStatus();
	return info;
}

//virtual 
void CFiscalPrinter_DatecsKrypton::PrintReceiptItem(const RECEIPT_ITEM& item)
{
	__int64 code = GetPrintCodeByArticle(item.article, item.name, item.price);
	long price_c = item.price.units();
	if (item.qty)
		CreateCommandV(L"PRINTITEM", FPCMD_PRINTITEM, L"%s%I64d;%ld.000;%ld.%02ld;", EMPTY_PARAM,
			code, item.qty, price_c / 100, price_c % 100);
	else {
		long weight_c = item.weight.units() * 10; // g!
		CreateCommandV(L"PRINTITEM", FPCMD_PRINTITEM, L"%s%ld;%ld.$03ld;%ld.%02ld;", EMPTY_PARAM,
			code, weight_c / 1000, weight_c % 1000, price_c / 100, price_c % 100);
	}
	SendCommand();
	std::string  result((char*)m_data);
	TraceINFO(L"\t\tRCV:%s", A2W(result.c_str()).c_str());

	if (item.discount) {
		long disc_c = item.discount.units();
		CreateCommandV(L"DISCOUNTABS", FPCMD_DISCOUNTABS, L"%s-%ld.%02ld;", EMPTY_PARAM, disc_c / 100, disc_c % 100);
		SendCommand();
		result = (char*)m_data;
		TraceINFO(L"\t\tRCV:%s", A2W(result.c_str()).c_str());
	}
	//void CFiscalPrinter_DatecsKrypton::PrintItem(int code, int qty, double fQty, int price, int dscPrc, int dscSum, bool bIsWeight)
	//ПЕЧАТЬ ДРОБНОГО КОЛИЧЕСТВА!!!!
	/*
	CString s;
	s.Format(L"%s%ld;%#.03f;%d.%02d;",
		EMPTY_PARAM, (long)code, (double)fQty, price / 100, price % 100);
	/*
	1. Хорошо бы знать, весовой товар, или нет
	2. При печати простого чека bIsWeight - правильный, а возвратный - нет!
	if (bIsWeight)
		s.Format(L"%s%ld;%#.03f;%d.%02d;",
			EMPTY_PARAM, (long) code, (double)fQty, price / 100, price % 100);
	else
		s.Format(L"%s%ld;%ld.000;%d.%02d;",
			EMPTY_PARAM, (long) code, (long) qty, price / 100, price % 100);
	*/
}

__int64 CFiscalPrinter_DatecsKrypton::GetPrintCodeByArticle(__int64 art, LPCWSTR szName, __currency price)
{
	__int64 code64 = makeCode(art, price);
	if (_mapCodes.count(code64) > 0)
		return _mapCodes[code64];
	return 0;
}

void CFiscalPrinter_DatecsKrypton::AddPrinterArticle(__int64 code, const wchar_t* name, const wchar_t* unit, long vat, long excise)
{
	CreateCommandV(L"FINDARTICLE", PFCMD_FINDARTICLE, L"%s%I64d;", EMPTY_PARAM, code);
	SendCommand();

	std::string found((char*) m_data); // char!

	if (IS_EMULATION())
		found = "0000;FFFFFF;";

	TraceINFO(L"\t\tRCV:%s", A2W(found.c_str()).c_str());
	if (found.size() > 0 && found.find("FFFFFF") == -1)
		return; // already programmed

	std::wstring sname(name);
	std::replace(sname.begin(), sname.end(), L';', L','); // semicolon is divider!
	if (sname.length() > MAX_NAME_LEN)
		sname.resize(MAX_NAME_LEN);


	std::wstring sunit(unit);
	std::replace(sunit.begin(), sunit.end(), L';', L','); // semicolon is divider!
	if (sunit.length() > MAX_UNIT_LEN)
		sunit.resize(MAX_UNIT_LEN);

	//00-weight modifier ??
	wchar_t taxGroup = FindTaxChar(vat, excise);

	// DEBUG
	if (taxGroup == '\0')
		taxGroup = L'0';

	CreateCommandV(L"ADDARTICLE", FPCMD_ADDARTICLE, L"%s%I64d;%s;%c;%ld;00;%s;", EMPTY_PARAM, 
		code, sname.c_str(), taxGroup, _tno, sunit.c_str());
	SendCommand();
}

long CFiscalPrinter_DatecsKrypton::GetPrinterLastZReportNo()
{
	long z_no = 0;
	CreateCommand(L"DAYCOUNTERS", FPCMD_DAYCOUNTERS, L"000000;0;");
	SendCommand();

	// ????;Z_NO;
	std::string info((char*)m_data);
	TraceINFO(L"\t\tRCV:%s", A2W(info.c_str()).c_str());

	if (IS_EMULATION()) {
		time_t now = time(0);
		tm  tm;
		localtime_s(&tm, &now);
		return (tm.tm_year + 1900) * 1000 + tm.tm_yday;
	}

	auto sinfo = _split(info, ';');
	if (sinfo.size() < 2)
		throw EQUIPException(L"DAYCOUNTERS data error");
	std::string r = sinfo[1];
	z_no = atol(r.c_str());
	if (z_no == 0) {
		// the printer is not FISCALIZED, Get value from DB?
		//__int64 no = ZREPORT_INFO::GetTestNumber(termId);
		// ;

	}
	return z_no;
}

long CFiscalPrinter_DatecsKrypton::GetPrinterLastReceiptNo()
{
	if (IS_EMULATION())
		return _testReceiptNo++;
	CreateCommand(L"DAYCOUNTERS", FPCMD_DAYCOUNTERS, L"000000;3;");
	SendCommand();
	std::string info((char*)m_data);
	TraceINFO(L"\t\tRCV:%s", A2W(info.c_str()).c_str());
	// XXXX;RECEIPT_NO;
	auto arr = _split(info, ';');
	long rcpNo = 0;
	if (arr.size() > 1) {
		rcpNo = atol(arr[1].c_str());
	}
	return rcpNo;
}

// virtual 
void CFiscalPrinter_DatecsKrypton::OpenCashDrawer()
{
	CreateCommand(L"CASHDRAWER", FPCMD_CASHDRAWER, EMPTY_PARAM);
	SendCommand();
}

void CFiscalPrinter_DatecsKrypton::TraceStatus()
{
	if (m_status[1] & FPS1_RCP_TAPE_ENDED)
		TraceINFO(FP_E_RECEIPT_TAPE_OVER);
	else if (m_status[1] & FPS1_RCP_TAPE_ENDING)
		TraceINFO(FP_W_RECEIPT_TAPE_ENDS);

	// or or
	if (m_status[1] & FPS1_CTL_TAPE_ENDING)
		TraceINFO(FP_W_CONTROL_TAPE_ENDS);
	else if (m_status[1] & FPS1_CTL_TAPE_ENDED)
		TraceINFO(FP_E_CONTROL_TAPE_OVER);
}

std::wstring CFiscalPrinter_DatecsKrypton::GetLastErrorS()
{
	wchar_t buff[MAX_COMMAND_LEN];

	if (m_status[1] & FPS1_RCP_TAPE_ENDED)
		return FP_E_RECEIPT_TAPE_OVER;

	if (m_status[1] & FPS1_CTL_TAPE_ENDED)
		return FP_E_CONTROL_TAPE_OVER;

	if (m_status[0] & FPS0_NO_DISPLAY)
		return FP_E_NO_DISPLAY;

	if (m_dwError == 0)
		return L"";

	if (m_dwError == err_NOT_CONNECTED)
		return L"Невозможно подключиться к фискальному регистратору. Проверьте скорость порта.";
	else if (m_dwError == 0x0002)
		return FP_E_INVALID_CODE;
	else if (m_dwError == 0x000b)
		return L"Ошибка состояния чека";
	else if (m_dwError == 0x0405)
		return L"Переход через сутки. Сделайте Z-отчет";
	else if (m_dwError == 0x0705)
		return L"Фискальный принтер не фискализирован.\nВыполнить операцию невозможно";
	else if (m_dwError == 0x0905)
		return L"С начала смены прошло более 24-х часов. Сделайте Z-отчет";
	else if (m_dwError == 0x0A05)
		return L"Необходимо скорректировать время";
	else if (m_dwError == 0x080B)
		return L"В касі недостатньо грошових коштів";
	else if (m_dwError == 0x070B)
		return L"Копия заданных чеков недоступна";
	else if (m_dwError == 0x0F05)
		return FP_E_DOCS_NOT_SENT;
	else if ((m_dwError & 0xFF03) != 0) {
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"Ошибка в команде (формат аргумента %d)", (int)(m_dwError & 0xFF00 >> 8));
		return buff;
	}
	else if ((m_dwError & 0xFF04) != 0) {
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"Ошибка в команде - (значение аргумента %d)", (int)(m_dwError & 0xFF00 >> 8));
		return buff;
	}
	swprintf_s(buff, MAX_COMMAND_LEN - 1, L"Общая ошибка принтера: 0x%x", (int)m_dwError);
	return buff;
}

// virtual 
bool CFiscalPrinter_DatecsKrypton::IsEndOfTape()
{
	return m_bEndOfTape;
}

// virtual 
long CFiscalPrinter_DatecsKrypton::PeriodReport(const wchar_t* report, bool bShort, const wchar_t* from, const wchar_t* to)
{
	const int NAME_LEN = 32;
	BYTE cmd = 0;
	const wchar_t* repname;
	if (wcsncmp(report, L"number", NAME_LEN) == 0) {
		cmd = FPCMD_NUMREPORTS;
		repname = L"FPCMD_NUMREPORTS";
	}
	else if (wcsncmp(report, L"date", NAME_LEN) == 0) {
		cmd = FPCMD_DATEREPORTS;
		repname = L"FPCMD_DATEREPORTS";
	}
	else
		throw EQUIPException(FP_E_INVALID_ARGUMENT);

	CreateCommand(L"OPENNONFISCAL", FPCMD_OPENNONFISCAL, EMPTY_PARAM);
	SendCommand();

	CreateCommandV(repname, cmd, L"%s%s;%s;%s;", EMPTY_PARAM, from, to, bShort ? L"0" : L"1");
	SendCommand();
	/*
	CString s;
	s.Format(L"%s%04d;%04d;%s;", EMPTY_PARAM, From, To,
		Short ? L"0" : L"1");
	CreateCommand(FPCMD_NUMREPORTS, s);
	SendCommand();
		CString s;
		s.Format(L"%s%02d%02d%02d;%02d%02d%02d;%s;", EMPTY_PARAM,
			From.GetDay(), From.GetMonth(), From.GetYear() - 2000,
			To.GetDay(), To.GetMonth(), To.GetYear() - 2000,
			Short ? L"0" : L"1");
		CreateCommand(FPCMD_DATEREPORTS, s);
		SendCommand();
	*/

	CreateCommand(L"CLOSEFISCAL", FPCMD_CLOSEFISCAL, L"000000;0;");
	SendCommand();

	m_nLastReceiptNo = GetPrinterLastReceiptNo(); // get receipt id
	return m_nLastReceiptNo;
}

// virtual 
JsonObject CFiscalPrinter_DatecsKrypton::FillZReportInfo()
{
	TraceINFO(L"DATECS [%s]. FillZReportInfo()", _id.c_str());
		
	JsonObject result;

	m_nLastZReportNo = GetPrinterLastZReportNo();
	result.Add(L"zno", m_nLastZReportNo);

	JsonObject payments;
	for (auto it = _taxChars.begin(); it != _taxChars.end(); ++it) {
		long taxNo = it->second - L'0';
		TAX_KEY taxKey;
		taxKey.key = it->first;
		DAY_SUM turn = GetDaySum(0, taxNo);
		DAY_SUM tax = GetDaySum(1, taxNo);
		if (turn.value1 || turn.value2 || tax.value1 || tax.value2) {
			JsonObject taxObj;
			taxObj.Add(L"sum", turn.value1);
			taxObj.Add(L"return", turn.value2);
			taxObj.Add(L"taxSum", tax.value1);
			taxObj.Add(L"taxReturn", tax.value2);
			taxObj.Add(L"tax", (long)taxKey.tax);
			if (taxKey.nested != -1) {
				auto nestedKey = FindTaxKey(taxKey.nested + L'0');
				taxObj.Add(L"nested", (long)nestedKey.tax);
			}
			payments.AddArray(&taxObj);
		}
	}

	result.AddArray(L"sums", &payments);

	DAY_SUM payCash = GetDaySum(2, _payModeCash - L'0');
	JsonObject cash;
	cash.Add(L"payment", payCash.value1);
	cash.Add(L"return", payCash.value2);
	result.Add(L"cash", &cash);

	DAY_SUM payCard = GetDaySum(2, _payModeCard - L'0');
	JsonObject card;
	card.Add(L"payment", payCard.value1);
	card.Add(L"return", payCard.value2);
	result.Add(L"card", &card);

	DAY_SUM cashOnHand = GetDaySum(3, 0);
	result.Add(L"cashOnHand", cashOnHand.value1);
	return result;
}

// virtual 
void CFiscalPrinter_DatecsKrypton::GetStatusMessages(std::vector<std::wstring>& msgs) 
{
	if (m_status[1] & FPS1_RCP_TAPE_ENDING)
		msgs.push_back(FP_W_RECEIPT_TAPE_ENDS);
	if (m_status[1] & FPS1_CTL_TAPE_ENDING)
		msgs.push_back(FP_W_CONTROL_TAPE_ENDS);
}

// virtual 
void CFiscalPrinter_DatecsKrypton::GetPrinterInfo(JsonObject& json)
{
	json.Add(L"model", _model.c_str());
	json.Add(L"port", _port.c_str());
	json.Add(L"zno", m_nLastZReportNo);
	json.Add(L"version", POS_MODULE_VERSION());
}
