// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "equipmentbase.h"
#include "fiscalprinter.h"
#include "fiscalprinterimpl.h"
#include "fp_Null.h"
#include "errors.h"

#define MAX_COMMAND_LEN 512

// virtual 
bool CFiscalPrinter_Null::IsOpen() const
{
	return true;
}

// virtual 
bool CFiscalPrinter_Null::IsReady() const
{
	return true;
}

// virtual 
void CFiscalPrinter_Null::SetParams(const PosConnectParams& prms)
{
	TraceINFO(L"TESTPRINTER [%s]. SetParams({payModes:'%s', taxModes:'%s'})",
		_id.c_str(), prms.payModes, prms.taxModes);
}

void CFiscalPrinter_Null::AddArticle(const RECEIPT_ITEM& item)
{
	TraceINFO(L"TESTPRINTER [%s]. AddArticle({article:%I64d, name:'%s', tax:%I64d, price:%ld, excise:%I64d})", 
		_id.c_str(), item.article, item.name, item.vat, item.price, item.excise);
}

// virtual 
void CFiscalPrinter_Null::PrintReceiptItem(const RECEIPT_ITEM& item)
{
	TraceINFO(L"TESTPRINTER [%s]. PrintReceiptItem({article:%I64d, name:'%s', qty:%d, weight:%ld, price:%ld, sum:%ld, discount:%ld})",
		_id.c_str(), item.article, item.name, item.qty, item.weight.units(), item.price.units(), item.sum.units(), item.discount.units());
}

// virtual 
void CFiscalPrinter_Null::Payment(PAYMENT_MODE mode, long sum)
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
	TraceINFO(L"TESTPRINTER [%s]. Payment({mode:'%s', sum:%ld})",
		_id.c_str(), strMode, sum);
}

// virtual 
long CFiscalPrinter_Null::CloseReceipt()
{
	TraceINFO(L"TESTPRINTER [%s]. CloseReceipt()", _id.c_str());
	return m_nLastReceipt;
}

// virtual 
void CFiscalPrinter_Null::Close()
{
	TraceINFO(L"TESTPRINTER [%s]. Close()", _id.c_str());
}

//virtual 
int CFiscalPrinter_Null::GetLastReceiptNo(bool bFromPrinter /*= false*/)
{
	return m_nLastReceipt++;
}

// virtual 
bool CFiscalPrinter_Null::Open(const wchar_t* port, DWORD baud)
{
	TraceINFO(L"TESTPRINTER [%s]. Open({port:'%s', baud:%d})", _id.c_str(), port, (int) baud);
	return true;
}

// virtual 
long CFiscalPrinter_Null::NullReceipt(bool bOpenCashDrawer)
{
	TraceINFO(L"TESTPRINTER [%s]. NullReceipt({openCashDrawer:%s})", _id.c_str(), bOpenCashDrawer ? L"true" : L"false");
	return m_nLastReceipt++;
}


// virtual 
void CFiscalPrinter_Null::OpenReceipt()
{
	TraceINFO(L"TESTPRINTER [%s]. OpenReceipt()", _id.c_str());
}

// virtual 
void CFiscalPrinter_Null::OpenReturnReceipt()
{
	TraceINFO(L"TESTPRINTER [%s]. OpenReturnReceipt()", _id.c_str());
}


// virtual 
bool CFiscalPrinter_Null::CancelReceipt(__int64 termId, bool& bClosed)
{
	throw EQUIPException(L"Yet not implemented");
}

// virtual 
void CFiscalPrinter_Null::PrintTotal()
{
	TraceINFO(L"TESTPRINTER [%s]. PrintTotal()", _id.c_str());
}

// virtual 
bool CFiscalPrinter_Null::CancelReceiptCommand()
{
	TraceINFO(L"TESTPRINTER [%s]. CancelReceiptCommand()", _id.c_str());
	return true;
}

// virtual 
bool CFiscalPrinter_Null::CopyReceipt()
{
	wchar_t buff[MAX_COMMAND_LEN];
	swprintf_s(buff, MAX_COMMAND_LEN - 1, L"NOPRINTER (key=%s): Print bill copy", _id.c_str());
	ReportMessage(buff);
	return true;
}

//virtual 
/*
bool CFiscalPrinter_Null::PrintCheckItem(const CFPCheckItemInfo& info)
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
LONG CFiscalPrinter_Null::GetCurrentZReportNo(bool bFromPrinter /*= false*/)
{
	if (bFromPrinter)
		m_nLastZReportNo = GetPrinterLastZReportNo();
	return m_nLastZReportNo;
}

// virtual 
void CFiscalPrinter_Null::Init()
{
	TraceINFO(L"TESTPRINTER [%s]. Init()", _id.c_str());
	m_nLastZReportNo = GetPrinterLastZReportNo();
}

long CFiscalPrinter_Null::GetPrinterLastZReportNo()
{
	__int64 no = 0; //TODO: ZREPORT_INFO::GetTestNumber(termId);
	if (no == 0)
		return false;
	return (LONG)no;
	return true;
}

// virtual 
/*
bool CFiscalPrinter_Null::FillZReportInfo(ZREPORT_INFO& zri)
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
long CFiscalPrinter_Null::XReport()
{
	TraceINFO(L"TESTPRINTER [%s]. XReport()", _id.c_str());
	return 523;
}

// virtual 
ZREPORT_RESULT CFiscalPrinter_Null::ZReport()
{
	TraceINFO(L"TESTPRINTER [%s]. ZReport()", _id.c_str());
	ZREPORT_RESULT result;
	result.no = 10;
	result.zno = 50;
	return result;
}

// virtual 
void CFiscalPrinter_Null::OpenCashDrawer()
{
	TraceINFO(L"TESTPRINTER [%s]. OpenCashDrawer()", _id.c_str());
}

// virtual 
SERVICE_SUM_INFO CFiscalPrinter_Null::ServiceInOut(bool bOut, __currency sum, bool bOpenCashDrawer)
{
	long sum_c = sum.units();
	if (bOut)
		TraceINFO(L"TESTPRINTER [%s]. ServiceInOut({mode:'withdraw', sum:%ld})", _id.c_str(), -sum_c);
	else if (sum_c > 0)
		TraceINFO(L"TESTPRINTER [%s]. ServiceInOut({mode:'deposit', sum:%ld})", _id.c_str(), sum_c);
	else
		TraceINFO(L"TESTPRINTER [%s]. ServiceInOut({mode:'get', sum:%ld})", _id.c_str(), sum_c);
	if (bOpenCashDrawer)
		OpenCashDrawer();
	SERVICE_SUM_INFO info;
	info.sumOnHand = __currency::from_units(1534);
	info.no = 55;
	return info;
}

// virtual 
/*
bool CFiscalPrinter_Null::CloseCheck(int sum, int get, CFiscalPrinter::PAY_MODE pm, LPCWSTR szText /*= NULL* /)
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
void CFiscalPrinter_Null::PrintFiscalText(const wchar_t* szText)
{
	TraceINFO(L"TESTPRINTER [%s]. PrintFiscalText({text:'%s')",
		_id.c_str(), szText);
}

// virtual 
void CFiscalPrinter_Null::PrintNonFiscalText(const wchar_t* szText)
{
	TraceINFO(L"TESTPRINTER [%s]. PrintNonFiscalText({text:'%s')",
		_id.c_str(), szText);
}

// virtual 
bool CFiscalPrinter_Null::PeriodicalByNo(BOOL Short, LONG From, LONG To)
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
bool CFiscalPrinter_Null::PeriodicalByDate(BOOL Short, COleDateTime From, COleDateTime To)
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
bool CFiscalPrinter_Null::GetCash(__int64 termId, COleCurrency& cy)
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
void CFiscalPrinter_Null::DisplayDateTime()
{
	throw EQUIPException(L"Yet not implemented");
}

// virtual 
void CFiscalPrinter_Null::DisplayClear()
{
	DisplayRow(0, L"");
	DisplayRow(1, L"");
}

// virtual 
void CFiscalPrinter_Null::DisplayRow(int nRow, const wchar_t* szString)
{
	throw EQUIPException(L"Yet not implemented");
}

// virtual 
void CFiscalPrinter_Null::SetCurrentTime()
{
	throw EQUIPException(L"Yet not implemented");
}

//virtual 
bool CFiscalPrinter_Null::ReportByArticles()
{
	throw EQUIPException(L"Yet not implemented");
}

// virtual 
bool CFiscalPrinter_Null::ReportRems()
{
	throw EQUIPException(L"Yet not implemented");
}

// virtual 
bool CFiscalPrinter_Null::ReportModemState()
{
	throw EQUIPException(L"Yet not implemented");
}

// virtual 
bool CFiscalPrinter_Null::PrintDiscount(long Type, long Sum, const wchar_t* szDescr)
{
	throw EQUIPException(L"Yet not implemented");
}

// virtual 
bool CFiscalPrinter_Null::PrintDiscountForAllReceipt(long dscPercent, long dscSum)
{
	throw EQUIPException(L"Yet not implemented");
}

void CFiscalPrinter_Null::ReportMessage(const wchar_t* msg)
{
	::MessageBox(nullptr, msg, nullptr, MB_OK | MB_ICONHAND);
}

// virtual 
void CFiscalPrinter_Null::TraceCommand(const wchar_t* command)
{
	TraceINFO(L"TESTPRINTER [%s]. %s", _id.c_str(), command);
}
