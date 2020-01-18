// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "fiscalprinterimpl.h"
#include "fp_Null.h"

#define MAX_COMMAND_LEN 512

//virtual 
int CFiscalPrinter_Null::GetLastReceiptNo(__int64 termId, bool bFromPrinter /*= false*/)
{
	return m_nLastReceipt++;
}

// virtual 
bool CFiscalPrinter_Null::OpenReturnReceipt(const wchar_t* szDepartmentName, __int64 termId, long billNo)
{
	throw CFPException(L"Yet not implemented");
}

// virtual 
void CFiscalPrinter_Null::Close()
{
	wchar_t buff[MAX_COMMAND_LEN];
	swprintf_s(buff, MAX_COMMAND_LEN - 1, L"NOPRINTER (key=\"%s\"): Close)", _id.c_str());
	ReportMessage(buff);
}

// virtual 
bool CFiscalPrinter_Null::Open(const wchar_t* port, DWORD baud)
{
	TraceINFO(L"TESTPRINTER [%s]. Open(port='%s', baud=%d})", _id.c_str(), port, (int) baud);
	return true;
}

// virtual 
void CFiscalPrinter_Null::NullReceipt(bool bOpenCashDrawer)
{
	TraceINFO(L"TESTPRINTER [%s]. NullReceipt({openCashDrawer=%s})", _id.c_str(), bOpenCashDrawer ? L"true" : L"false");
}

// virtual 
bool CFiscalPrinter_Null::CancelReceipt(__int64 termId, bool& bClosed)
{
	throw CFPException(L"Yet not implemented");
}

// virtual 
bool CFiscalPrinter_Null::CancelReceiptCommand(__int64 termId)
{
	wchar_t buff[MAX_COMMAND_LEN];
	swprintf_s(buff, MAX_COMMAND_LEN - 1, L"NOPRINTER (key=%s): Cancel bill", _id.c_str());
	ReportMessage(buff);
	return true;
}

// virtual 
bool CFiscalPrinter_Null::CopyBill()
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
LONG CFiscalPrinter_Null::GetCurrentZReportNo(__int64 termId, bool bFromPrinter /*= false*/)
{
	if (bFromPrinter)
		GetPrinterLastZReportNo(termId, m_nLastZReportNo);
	return m_nLastZReportNo;
}

// virtual 
bool CFiscalPrinter_Null::Init(__int64 termId)
{
	try
	{
		GetPrinterLastZReportNo(termId, m_nLastZReportNo);
	}
	catch (CFPException ex)
	{
		m_strError = ex.GetError();
		return false;
	}
	return true;
}

bool CFiscalPrinter_Null::GetPrinterLastZReportNo(__int64 termId, long& zNo)
{
	__int64 no = 0; //TODO: ZREPORT_INFO::GetTestNumber(termId);
	if (no == 0)
		return false;
	zNo = (LONG)no;
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
void CFiscalPrinter_Null::XReport()
{
	TraceINFO(L"TESTPRINTER [%s]. XReport()", _id.c_str());
}

// virtual 
void CFiscalPrinter_Null::ZReport()
{
	TraceINFO(L"TESTPRINTER [%s]. ZReport()", _id.c_str());
}

// virtual 
void CFiscalPrinter_Null::OpenCashDrawer()
{
	TraceINFO(L"TESTPRINTER [%s]. OpenCashDrawer()", _id.c_str());
}

// virtual 
bool CFiscalPrinter_Null::ServiceInOut(__int64 sum, __int64 hid)
{
	wchar_t buff[MAX_COMMAND_LEN];
	if (sum < 0)
	{
		__int64 sx = -sum;
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"NOPRINTER: Service withdraw (%d.%02d)", (int)(sx / 100), (int)(sx % 100));
	}
	else if (sum > 0)
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"NOPRINTER: Service deposit (%d.%02d)", (int)(sum / 100), (int)(sum % 100));
	else
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"NOPRINTER: Service withdraw/deposit. Empty value");
	ReportMessage(buff);
	return true;
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
bool CFiscalPrinter_Null::PrintFiscalText(const wchar_t* szText)
{
	wchar_t buff[MAX_COMMAND_LEN];
	swprintf_s(buff, MAX_COMMAND_LEN - 1, L"NOPRINTER: FiscalText: %s", szText);
	ReportMessage(buff);
	return true;
}

// virtual 
bool CFiscalPrinter_Null::PrintNonFiscalText(const wchar_t* szText)
{
	wchar_t buff[MAX_COMMAND_LEN];
	swprintf_s(buff, MAX_COMMAND_LEN - 1, L"NOPRINTER: NonFiscalText: %s", szText);
	ReportMessage(buff);
	return true;
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
	throw CFPException(L"Yet not implemented");
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
	throw CFPException(L"Yet not implemented");
}

// virtual 
void CFiscalPrinter_Null::SetCurrentTime()
{
	throw CFPException(L"Yet not implemented");
}

//virtual 
bool CFiscalPrinter_Null::ReportByArticles()
{
	throw CFPException(L"Yet not implemented");
}

// virtual 
bool CFiscalPrinter_Null::ReportRems()
{
	throw CFPException(L"Yet not implemented");
}

// virtual 
bool CFiscalPrinter_Null::ReportModemState()
{
	throw CFPException(L"Yet not implemented");
}

// virtual 
bool CFiscalPrinter_Null::PrintDiscount(long Type, long Sum, const wchar_t* szDescr)
{
	throw CFPException(L"Yet not implemented");
}

// virtual 
bool CFiscalPrinter_Null::PrintDiscountForAllReceipt(long dscPercent, long dscSum)
{
	throw CFPException(L"Yet not implemented");
}

void CFiscalPrinter_Null::ReportMessage(const wchar_t* msg)
{
	::MessageBox(nullptr, msg, nullptr, MB_OK | MB_ICONHAND);
}
