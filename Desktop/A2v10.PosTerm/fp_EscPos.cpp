// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "equipmentbase.h"
#include "fiscalprinter.h"
#include "fiscalprinterimpl.h"
#include "fp_EscPos.h"
#include "errors.h"

#define MAX_COMMAND_LEN 512

CFiscalPrinter_EscPos::CFiscalPrinter_EscPos(const wchar_t* model)
	: m_nLastReceipt(1234), _nLastZReportNo(2233)
{
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
	//TraceINFO(L"ESCPOS [%s]. SetParams({payModes:'%s', taxModes:'%s'})",
		//_id.c_str(), prms.payModes, prms.taxModes);
}

void CFiscalPrinter_EscPos::AddArticle(const RECEIPT_ITEM& item)
{
	TraceINFO(L"ESCPOS [%s]. AddArticle({article:%I64d, name:'%s', tax:%ld, price:%ld, excise:%ld})", 
		_id.c_str(), item.article, item.name, item.vat.units(), item.price.units(), item.excise.units());
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
	return m_nLastReceipt++;
}

// virtual 
void CFiscalPrinter_EscPos::Close()
{
	TraceINFO(L"ESCPOS [%s]. Close()", _id.c_str());
}

// virtual 
bool CFiscalPrinter_EscPos::Open(const wchar_t* port, DWORD baud)
{
	TraceINFO(L"ESCPOS [%s]. Open({port:'%s', baud:%d})", _id.c_str(), port, (int) baud);
	return true;
}

// virtual 
long CFiscalPrinter_EscPos::NullReceipt(bool bOpenCashDrawer)
{
	TraceINFO(L"ESCPOS [%s]. NullReceipt({openCashDrawer:%s})", _id.c_str(), bOpenCashDrawer ? L"true" : L"false");
	return m_nLastReceipt++;
}


// virtual 
void CFiscalPrinter_EscPos::OpenReceipt()
{
	TraceINFO(L"ESCPOS [%s]. OpenReceipt()", _id.c_str());
}

// virtual 
void CFiscalPrinter_EscPos::OpenReturnReceipt()
{
	TraceINFO(L"ESCPOS [%s]. OpenReturnReceipt()", _id.c_str());
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
}

// virtual 
long CFiscalPrinter_EscPos::CopyReceipt()
{
	TraceINFO(L"ESCPOS [%s]. CopyReceipt()", _id.c_str());
	return m_nLastReceipt++;
}

//virtual 
/*
bool CFiscalPrinter_EscPos::PrintCheckItem(const CFPCheckItemInfo& info)
{
	CString s;
	s.Format(L"%s (qty=%#.03f, iqty=%ld, price=%ld, excise=%s)",
		info.m_name, (double)info.m_fQty, (long)info.m_iQty,
		(long)info.m_price,
		info.m_bExcise ? L"true" : L"false");
	int dscPrc = info.m_dscPercent;
	int dscSum = info.m_dscSum;
	if (dscPrc)
	{
		ATLASSERT(!dscSum);
		CString d;
		d.Format(L",-%02d.%02d", dscPrc / 100, dscPrc % 100);
		s += d;
	}
	else if (dscSum)
	{
		ATLASSERT(!dscPrc);
		CString d;
		d.Format(L";-%02d.%02d", dscSum / 100, dscSum % 100);
		s += d;
	}
	AfxMessageBox(s);
	return true;
}
*/

// virtual
/*
LONG CFiscalPrinter_EscPos::GetCurrentZReportNo(bool bFromPrinter /*= false * /)
{
	if (bFromPrinter)
		_nLastZReportNo = GetPrinterLastZReportNo();
	return _nLastZReportNo;
}
*/

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
/*
bool CFiscalPrinter_EscPos::FillZReportInfo(ZREPORT_INFO& zri)
{
	ZREPORT_INFO nullzri;
	nullzri.m_termId = zri.m_termId;
	nullzri.LoadTest();

	zri.m_sum_nv = nullzri.m_sum_nv;
	zri.m_sum_v = nullzri.m_sum_v;
	zri.m_vsum = nullzri.m_vsum;
	zri.m_pay0 = nullzri.m_pay0;
	zri.m_pay1 = nullzri.m_pay1;

	// m_currentZRepNo = nullzri.m_zNo; Этого делать нельзя, система создаст новый z-отчет

	return true;
}
*/

// virtual 
long CFiscalPrinter_EscPos::XReport()
{
	TraceINFO(L"ESCPOS [%s]. XReport()", _id.c_str());
	return m_nLastReceipt++;
}

// virtual 
ZREPORT_RESULT CFiscalPrinter_EscPos::ZReport()
{
	TraceINFO(L"ESCPOS [%s]. ZReport()", _id.c_str());
	ZREPORT_RESULT result;
	result.no = m_nLastReceipt++;
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
/*
bool CFiscalPrinter_EscPos::CloseCheck(int sum, int get, CFiscalPrinter::PAY_MODE pm, LPCWSTR szText /*= NULL* /)
{
	CString msg;
	if (pm == CFiscalPrinter::_fpay_card)
		msg.Format(L"NOPRINTER (key=%s): Печать чека (кредитная карта)\nCумма=(%d.%02d), Получено=(%d.%02d)", (LPCWSTR)_id, sum / 100, sum % 100, get / 100, get % 100);
	else if (pm == CFiscalPrinter::_fpay_cash)
		msg.Format(L"NOPRINTER (key=%s): Печать чека (наличные)\nCумма=(%d.%02d), Получено=(%d.%02d)", (LPCWSTR)m_strKey, sum / 100, sum % 100, get / 100, get % 100);
	else if (pm == CFiscalPrinter::_fpay_credit)
		msg.Format(L"NOPRINTER (key=%s): Печать чека (кредит)\nCумма=(%d.%02d), Получено=(%d.%02d)", (LPCWSTR)m_strKey, sum / 100, sum % 100, get / 100, get % 100);
	else
		msg.Format(L"NOPRINTER (key=%s): Печать чека (INVALID PAY_MODE)\nCумма=(%d.%02d), Получено=(%d.%02d)", (LPCWSTR)m_strKey, sum / 100, sum % 100, get / 100, get % 100);
	AfxMessageBox(msg);
	if (szText && szText)
	{
		CString r;
		CString rx;
		for (int i = 0; true; i++)
		{
			if (!AfxExtractSubString(r, szText, i, L'\n'))
				break;
			rx.Format(L"%s -- %d", (LPCWSTR)r, r.GetLength());
			AfxMessageBox(rx);
		}
	}
	return true;
}
*/

// virtual 
void CFiscalPrinter_EscPos::PrintFiscalText(const wchar_t* szText)
{
	TraceINFO(L"ESCPOS [%s]. PrintFiscalText({text:'%s')",
		_id.c_str(), szText);
}

// virtual 
void CFiscalPrinter_EscPos::PrintNonFiscalText(const wchar_t* szText)
{
	TraceINFO(L"ESCPOS [%s]. PrintNonFiscalText({text:'%s')",
		_id.c_str(), szText);
}

// virtual 
bool CFiscalPrinter_EscPos::PeriodicalByNo(BOOL Short, LONG From, LONG To)
{
	wchar_t buff[MAX_COMMAND_LEN];
	if (Short)
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"NOPRINTER: Short periodic report by numbers: %ld-%ld", From, To);
	else
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"NOPRINTER: Long periodic report by numbers: %ld-%ld", From, To);
	ReportMessage(buff);
	return true;
}

// virtual 
/*
bool CFiscalPrinter_EscPos::PeriodicalByDate(BOOL Short, COleDateTime From, COleDateTime To)
{
	if (Short)
		AfxMessageBox(L"NOPRINTER: Короткий периодический отчет по датам: " + CConvert::Date2String(From) + L":" + CConvert::Date2String(To));
	else
		AfxMessageBox(L"NOPRINTER: Полный периодический отчет по датам: " + CConvert::Date2String(From) + L":" + CConvert::Date2String(To));
	return true;
}
*/

/*
// virtual 
bool CFiscalPrinter_EscPos::GetCash(__int64 termId, COleCurrency& cy)
{
	// достаем процедурой
	ZREPORT_INFO zri;
	zri.m_termId = termId;
	zri.m_zNo = m_nLastZReportNo;
	if (!zri.Find(L"cash"))
		return false;
	cy = zri.m_sum_nv; // в этом поле ЗНАЧЕНИЕ суммы
	return true;
}
*/

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
	throw EQUIPException(L"Yet not implemented");
}

// virtual 
void CFiscalPrinter_EscPos::SetCurrentTime()
{
	throw EQUIPException(L"Yet not implemented");
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
	json.Add(L"model", L"Null Printer");
	json.Add(L"port", L"Any");
	json.Add(L"zno", _nLastZReportNo);
}
