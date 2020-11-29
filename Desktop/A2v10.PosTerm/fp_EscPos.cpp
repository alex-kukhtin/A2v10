// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "equipmentbase.h"
#include "fiscalprinter.h"
#include "fiscalprinterimpl.h"
#include "fp_EscPos.h"
#include "errors.h"
#include "escpos_printer.h"
#include "stringtools.h"

#define MAX_COMMAND_LEN 512

CFiscalPrinter_EscPos::CFiscalPrinter_EscPos(const wchar_t* model)
	: _nLastReceipt(-1), _nLastZReportNo(-1), _cashSum(0), _printer(nullptr)
{
}

CFiscalPrinter_EscPos::~CFiscalPrinter_EscPos()
{
	if (_printer != nullptr) {
		delete _printer;
		_printer = nullptr;
	}
}

// virtual 
bool CFiscalPrinter_EscPos::IsOpen() const
{
	return true;
}

// virtual 
bool CFiscalPrinter_EscPos::IsReady() const
{
	return true;
}

// virtual 
void CFiscalPrinter_EscPos::GetErrorCode() 
{
}

// virtual 
void CFiscalPrinter_EscPos::SetParams(const PosConnectParams& prms)
{
	TraceINFO(L"ESCPOS [%s]. SetParams({printerName:'%s', lineLen:'%d'})",
		_id.c_str(), prms.printerName, prms.lineLen);
	_printer = new EscPos_Printer(prms.printerName, prms.lineLen);
}

// virtual 
void CFiscalPrinter_EscPos::SetNonFiscalInfo(const PosNonFiscalInfo& info)
{
	TraceINFO(L"ESCPOS [%s]. SetNonFiscalInfo({repno:'%d', zno:'%d'})",
		_id.c_str(), info.rcpno, info.zno);
	_nLastReceipt = info.rcpno;
	_nLastZReportNo = info.zno;
}

void CFiscalPrinter_EscPos::AddArticle(const RECEIPT_ITEM& item)
{
	TraceINFO(L"ESCPOS [%s]. AddArticle({article:%I64d, name:'%s', tax:%ld, price:%ld, excise:%ld})", 
		_id.c_str(), item.article, item.name, item.vat.units(), item.price.units(), item.excise.units());
	// do nothing
}

// virtual 
void CFiscalPrinter_EscPos::PrintReceiptItem(const RECEIPT_ITEM& item)
{
	TraceINFO(L"ESCPOS [%s]. PrintReceiptItem({article:%I64d, name:'%s', qty:%d, weight:%ld, price:%ld, sum:%ld, discount:%ld})",
		_id.c_str(), item.article, item.name, item.qty, item.weight.units(), item.price.units(), item.sum.units(), item.discount.units());
}

// virtual 
void CFiscalPrinter_EscPos::Payment(PAYMENT_MODE mode, long sum)
{
	const wchar_t* strMode = L"unknown";
	switch (mode) {
	case PAYMENT_MODE::_pay_card:
		strMode = L"card";
		break;
	case PAYMENT_MODE::_pay_cash:
		strMode = L"cash";
		break;
	}
	TraceINFO(L"ESCPOS [%s]. Payment({mode:'%s', sum:%ld})",
		_id.c_str(), strMode, sum);
}

// virtual 
long CFiscalPrinter_EscPos::CloseReceipt(bool bDisplay)
{
	TraceINFO(L"ESCPOS [%s]. CloseReceipt()", _id.c_str());
	PrinterEndReceipt();
	return _nLastReceipt++;
}

// virtual 
void CFiscalPrinter_EscPos::Close()
{
	TraceINFO(L"ESCPOS [%s]. Close()", _id.c_str());
}

// virtual 
bool CFiscalPrinter_EscPos::Open(const wchar_t* port, DWORD baud)
{
	TraceINFO(L"ESCPOS [%s]. Open({printerName:'%s'})", _id.c_str(), _printerName.c_str());
	return true;
}

// virtual 
long CFiscalPrinter_EscPos::NullReceipt(bool bOpenCashDrawer)
{
	if (_printer == nullptr)
		throw EQUIPException(L"Print error");
	TraceINFO(L"ESCPOS [%s]. NullReceipt({openCashDrawer:%s})", _id.c_str(), bOpenCashDrawer ? L"true" : L"false");
	_printer->Start();
	_printer->AppendLine(L"Нульовий чек", EscPos_Printer::Align::Center);
	PrinterTotalSum(0);
	PrinterEndReceipt();
	return _nLastReceipt++;
}


// virtual 
void CFiscalPrinter_EscPos::OpenReceipt()
{
	TraceINFO(L"ESCPOS [%s]. OpenReceipt()", _id.c_str());
	// do nothing
}

// virtual 
void CFiscalPrinter_EscPos::OpenReturnReceipt()
{
	TraceINFO(L"ESCPOS [%s]. OpenReturnReceipt()", _id.c_str());
	// do nothing
}


// virtual 
void CFiscalPrinter_EscPos::CancelOrCloseReceipt()
{
	TraceINFO(L"ESCPOS [%s]. CancelOrCloseReceipt()", _id.c_str());
}

// virtual 
void CFiscalPrinter_EscPos::CancelReceiptUnconditional()
{
	TraceINFO(L"ESCPOS [%s]. CancelReceiptUnconditional()", _id.c_str());
}

// virtual 
void CFiscalPrinter_EscPos::PrintTotal()
{
	TraceINFO(L"ESCPOS [%s]. PrintTotal()", _id.c_str());
	// TODO: totalSum
	PrinterTotalSum(123455);
}

// virtual 
long CFiscalPrinter_EscPos::CopyReceipt()
{
	TraceINFO(L"ESCPOS [%s]. CopyReceipt()", _id.c_str());
	throw EQUIPException(L"Receipt copy is not supported");
}

// virtual 
void CFiscalPrinter_EscPos::Init()
{
	TraceINFO(L"ESCPOS [%s]. Init()", _id.c_str());
	_nLastZReportNo = GetPrinterLastZReportNo();
}

long CFiscalPrinter_EscPos::GetPrinterLastZReportNo()
{
	return _nLastZReportNo;
}

// virtual 
long CFiscalPrinter_EscPos::XReport()
{
	TraceINFO(L"ESCPOS [%s]. XReport()", _id.c_str());
	return _nLastReceipt++;
}

// virtual 
ZREPORT_RESULT CFiscalPrinter_EscPos::ZReport()
{
	TraceINFO(L"ESCPOS [%s]. ZReport()", _id.c_str());
	ZREPORT_RESULT result;
	result.no = _nLastReceipt++;
	result.zno = _nLastZReportNo++;
	return result;
}

// virtual 
void CFiscalPrinter_EscPos::OpenCashDrawer()
{
	TraceINFO(L"ESCPOS [%s]. OpenCashDrawer()", _id.c_str());
}

// virtual 
SERVICE_SUM_INFO CFiscalPrinter_EscPos::ServiceInOut(bool bOut, __currency sum, bool bOpenCashDrawer)
{
	long sum_c = sum.units();
	if (bOut)
		TraceINFO(L"ESCPOS [%s]. ServiceInOut({mode:'withdraw', sum:%ld})", _id.c_str(), -sum_c);
	else if (sum_c > 0)
		TraceINFO(L"ESCPOS [%s]. ServiceInOut({mode:'deposit', sum:%ld})", _id.c_str(), sum_c);
	else
		TraceINFO(L"ESCPOS [%s]. ServiceInOut({mode:'get', sum:%ld})", _id.c_str(), sum_c);
	if (bOpenCashDrawer)
		OpenCashDrawer();
	SERVICE_SUM_INFO info;
	info.sumOnHand = __currency::from_units(1534);
	info.no = 55;
	return info;
}

// virtual 
void CFiscalPrinter_EscPos::PrintFiscalText(const wchar_t* szText)
{
	TraceINFO(L"ESCPOS [%s]. PrintFiscalText({text:'%s')",
		_id.c_str(), szText);
	if (_printer == nullptr)
		throw EQUIPException(L"Print error");
	_printer->AppendLine(szText);
}

// virtual 
void CFiscalPrinter_EscPos::PrintNonFiscalText(const wchar_t* szText)
{
	TraceINFO(L"ESCPOS [%s]. PrintNonFiscalText({text:'%s')",
		_id.c_str(), szText);
	if (_printer == nullptr)
		throw EQUIPException(L"Print error");
	_printer->AppendLine(szText);
}

// virtual 
bool CFiscalPrinter_EscPos::PeriodicalByNo(BOOL Short, LONG From, LONG To)
{
	wchar_t buff[MAX_COMMAND_LEN];
	if (Short)
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"ESCPOS: Short periodic report by numbers: %ld-%ld", From, To);
	else
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"ESCPOS: Long periodic report by numbers: %ld-%ld", From, To);
	ReportMessage(buff);
	return true;
}


// virtual 
void CFiscalPrinter_EscPos::DisplayDateTime()
{
	throw EQUIPException(L"Yet not implemented");
}

// virtual 
void CFiscalPrinter_EscPos::DisplayClear()
{
	DisplayRow(0, L"", TEXT_ALIGN::_left);
	DisplayRow(1, L"", TEXT_ALIGN::_left);
}

// virtual 
void CFiscalPrinter_EscPos::DisplayRow(int nRow, const wchar_t* szString, TEXT_ALIGN align)
{
}

// virtual 
void CFiscalPrinter_EscPos::SetCurrentTime()
{
}

//virtual 
bool CFiscalPrinter_EscPos::ReportByArticles()
{
	throw EQUIPException(L"Yet not implemented");
}

// virtual 
bool CFiscalPrinter_EscPos::ReportRems()
{
	throw EQUIPException(L"Yet not implemented");
}

// virtual 
bool CFiscalPrinter_EscPos::ReportModemState()
{
	throw EQUIPException(L"Yet not implemented");
}

// virtual 
bool CFiscalPrinter_EscPos::PrintDiscount(long Type, long Sum, const wchar_t* szDescr)
{
	throw EQUIPException(L"Yet not implemented");
}

// virtual 
bool CFiscalPrinter_EscPos::PrintDiscountForAllReceipt(long dscPercent, long dscSum)
{
	throw EQUIPException(L"Yet not implemented");
}

void CFiscalPrinter_EscPos::ReportMessage(const wchar_t* msg)
{
	::MessageBox(nullptr, msg, nullptr, MB_OK | MB_ICONHAND);
}

// virtual 
void CFiscalPrinter_EscPos::TraceCommand(const wchar_t* command)
{
	TraceINFO(L"ESCPOS [%s]. %s", _id.c_str(), command);
}

// virtual 
JsonObject  CFiscalPrinter_EscPos::FillZReportInfo()
{
	JsonObject json;
	json.Add(L"zno", _nLastZReportNo);
	return json;
}

// virtual 
void CFiscalPrinter_EscPos::GetStatusMessages(std::vector<std::wstring>& msgs)
{
}

// virtual 
void CFiscalPrinter_EscPos::GetPrinterInfo(JsonObject& json)
{
	json.Add(L"model", L"ESC/POS Printer");
	json.Add(L"zno", _nLastZReportNo);
	json.Add(L"nonfiscal", true);
}

void CFiscalPrinter_EscPos::PrinterTotalSum(__currency sum)
{
	if (_printer == nullptr)
		throw EQUIPException(L"Print error");
	// double width
	int lineLen = _printer->LineLength() / 2;
	std::wstring strSum = sum.to_wstring();
	std::wstring text = L"Сума";
	int delta = lineLen - (4 + strSum.length());
	text.append(std::wstring(delta, L' '));
	text.append(strSum);
	_printer->AppendGraphLine(EscPos_Printer::LineType::Single);
	_printer->AppendLine(text.c_str(), EscPos_Printer::Align::Left, EscPos_Printer::PrintMode::DoubleWidth | EscPos_Printer::PrintMode::DoubleHeight);
	_printer->AppendGraphLine(EscPos_Printer::LineType::Single);
}

void CFiscalPrinter_EscPos::PrinterEndReceipt() 
{
	if (_printer == nullptr)
		throw EQUIPException(L"Print error");
	// ReceiptNo, Date Time
	std::wstring rcpNo = FormatString(L"%ld", _nLastReceipt);
	int delta = _printer->LineLength() - rcpNo.length() - 19 /*date/time length*/;
	time_t time = std::time(0);
	tm now;
	localtime_s(&now, &time);
	std::wstring dateTimeString = FormatString(L"%0d-%0d-%04d %02d:%02d:%02d", 
		now.tm_mday, now.tm_mon + 1, now.tm_year + 1900, now.tm_hour, now.tm_min, now.tm_sec);
	rcpNo.append(std::wstring(delta, L' '));
	rcpNo.append(dateTimeString);
	_printer->AppendLine(rcpNo.c_str());
	_printer->Cut();
	_printer->Print();
}