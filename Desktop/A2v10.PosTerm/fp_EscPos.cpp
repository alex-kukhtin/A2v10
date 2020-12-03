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

/*TODO:
Весовой товар
инструкция
выложить ChromeExtension
NonFiscal - сделать так же
*/

const int ITEM_MARGIN = 4;


CFiscalPrinter_EscPos::CFiscalPrinter_EscPos(const wchar_t* model)
	: _nLastReceipt(-1), _nLastZReportNo(-1), _cashSum(0), _totalSum(0), _printer(nullptr)
{
	_printerName = model;
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
	int ll = prms.lineLen;
	if (ll == 0)
		ll = EscPos_Printer::DefaultLineLength();
	TraceINFO(L"ESCPOS [%s]. SetParams({shareName:'%s', lineLen: %d})",
		_id.c_str(), prms.shareName, ll);
	_printer = new EscPos_Printer(prms.shareName, ll);
}

// virtual 
void CFiscalPrinter_EscPos::SetNonFiscalInfo(const PosNonFiscalInfo& info)
{
	TraceINFO(L"ESCPOS [%s]. SetNonFiscalInfo({rcpno: %d, zno: %d, header: '%s', footer: '%s'})",
		_id.c_str(), info.rcpno, info.zno, info.header, info.footer);
	_nLastReceipt = info.rcpno;
	_nLastZReportNo = info.zno;
	_header = info.header;
	_footer = info.footer;
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
	_totalSum += item.sum;
	std::wstring strQty;
	std::wstring strPrice(item.price.to_wstring());
	std::wstring strSum(item.sum.to_wstring());
	if (item.weight.units() == 0) 
	{
		strQty = FormatString(L"%d", item.qty);
	}
	else 
	{
		// weight
		strQty = item.weight.to_wstring3digit();
	}

	PrintName(item.name);

	std::wstring strQPS = strQty;
	strQPS.append(L" x ");
	strQPS.append(strPrice);
	int delta = _printer->LineLength() - strQPS.length() - strSum.length();
	std::wstring line1(strQPS);
	line1.append(std::wstring(delta, L' '));
	line1.append(strSum);
	_printer->AppendLine(line1.c_str());
}

void CFiscalPrinter_EscPos::PrintName(const wchar_t* name)
{
	std::wstring strName(name);
	size_t len = _printer->LineLength() - ITEM_MARGIN;
	if (strName.length() <= len)
		_printer->AppendLine(strName.c_str());
	else 
	{
		size_t offset = 0;
		std::wstring subStr;
		while (true) {
			if (offset >= strName.length())
				break;
			subStr = strName.substr(offset, len);
			_printer->AppendLine(subStr.c_str());
			offset += len;
		}
	}
}


// virtual 
void CFiscalPrinter_EscPos::Payment(PAYMENT_MODE mode, long sum)
{
	const wchar_t* strMode = L"unknown";
	std::wstring strText(L"Готівка");
	switch (mode) {
	case PAYMENT_MODE::_pay_card:
		strMode = L"card";
		strText.assign(L"Картка");
		break;
	case PAYMENT_MODE::_pay_cash:
		strMode = L"cash";
		break;
	}
	TraceINFO(L"ESCPOS [%s]. Payment({mode:'%s', sum:%ld})",
		_id.c_str(), strMode, sum);
	__currency cySum = __currency::from_units(sum);
	std::wstring strSum  = cySum.to_wstring();
	int delta = _printer->LineLength() - strSum.length() - strText.length();
	strText.append(std::wstring(delta, L' '));
	strText.append(strSum);
	_printer->AppendLine(strText.c_str());
	long charge = cySum.units() - _totalSum.units();
	if (charge > 0) {
		std::wstring strCharge = __currency::from_units(charge).to_wstring();
		strText.assign(L"Решта");
		delta = _printer->LineLength() - strCharge.length() - strText.length();
		strText.append(std::wstring(delta, L' '));
		strText.append(strCharge);
		_printer->AppendLine(strText.c_str());
	}
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
	PrintMutliline(_header, false, true);
	_printer->AppendLine(L"Нульовий чек", EscPos_Printer::Align::Center, EscPos_Printer::PrintMode::DoubleWidth);
	PrinterTotalSum(0);
	PrinterEndReceipt();
	return _nLastReceipt++;
}


// virtual 
void CFiscalPrinter_EscPos::OpenReceipt()
{
	TraceINFO(L"ESCPOS [%s]. OpenReceipt()", _id.c_str());
	// do nothing
	_totalSum = 0;
	_printer->Start();
	PrintMutliline(_header, false, true);
}

// virtual 
void CFiscalPrinter_EscPos::OpenReturnReceipt()
{
	TraceINFO(L"ESCPOS [%s]. OpenReturnReceipt()", _id.c_str());
	// do nothing
	_totalSum = 0;
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
	PrinterTotalSum(_totalSum);
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
}

// virtual 
long CFiscalPrinter_EscPos::XReport()
{
	TraceINFO(L"ESCPOS [%s]. XReport()", _id.c_str());
	throw EQUIPException(L"XReport is not supported");
	return _nLastReceipt++;
}

// virtual 
ZREPORT_RESULT CFiscalPrinter_EscPos::ZReport()
{
	TraceINFO(L"ESCPOS [%s]. ZReport()", _id.c_str());
	ZREPORT_RESULT result;
	result.no = _nLastReceipt++;
	result.zno = _nLastZReportNo;
	_nLastZReportNo = -1; // RESET
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
	{
		TraceINFO(L"ESCPOS [%s]. ServiceInOut({mode:'withdraw', sum:%ld})", _id.c_str(), -sum_c);
		throw EQUIPException(L"ServiceInOut is not supported");
	}
	else if (sum_c > 0) 
	{
		TraceINFO(L"ESCPOS [%s]. ServiceInOut({mode:'deposit', sum:%ld})", _id.c_str(), sum_c);
		throw EQUIPException(L"ServiceInOut is not supported");
	} 
	else 
	{
		TraceINFO(L"ESCPOS [%s]. ServiceInOut({mode:'get', sum:%ld})", _id.c_str(), sum_c);
	}
	if (bOpenCashDrawer)
		OpenCashDrawer();
	SERVICE_SUM_INFO info;
	info.sumOnHand = __currency::from_units(0);
	info.no = 0;
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
	TraceINFO(L"ESCPOS [%s]. PrintNonFiscalText({short: %s, from: %ld, to: %ld})",
		_id.c_str(), Short ? L"true" : L"false", From, To);
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
	std::wstring dateTimeString = FormatString(L"%02d-%02d-%04d %02d:%02d:%02d", 
		now.tm_mday, now.tm_mon + 1, now.tm_year + 1900, now.tm_hour, now.tm_min, now.tm_sec);
	rcpNo.append(std::wstring(delta, L' '));
	rcpNo.append(dateTimeString);
	_printer->AppendLine(rcpNo.c_str());
	PrintMutliline(_footer, true, false);
	_printer->Cut();
	_printer->Print();
}

void CFiscalPrinter_EscPos::PrintMutliline(const std::wstring& line, bool before /*= false*/, bool after /*= false*/)
{
	if (line.empty())
		return;
	if (before)
		_printer->AppendLine();
	std::wstringstream wss(line);
	std::wstring tmp;
	while (std::getline(wss, tmp, L'\n'))
		_printer->AppendLine(tmp.c_str());
	if (after)
		_printer->AppendLine();
}
