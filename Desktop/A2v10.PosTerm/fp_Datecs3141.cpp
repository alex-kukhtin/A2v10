// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "fiscalprinterimpl.h"
#include "fp_DatecsBase.h"
#include "fp_Datecs3141.h"

#define MAX_COMMAND_LEN 255

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
	FPS0_SERVICE_MODE = 0x01, // 0
	FPS0_BUFFER_OVER = 0x02, // 1
	FPS0_NO_FAILURE = 0x04, // 2
	FPS0_NO_DISPLAY = 0x08, // 3
	FPS0_PRINTER_NOTRDY = 0x10, // 4
	FPS0_NEED_RESET = 0x20, // 5
	FPS0_OTHER_HW_ERROR = 0x40, // 6

	FPS1_CHK_TAPE_ENDING = 0x01,  // 0
	FPS1_CTL_TAPE_ENDING = 0x02,  // 1
	FPS1_CHK_TAPE_ENDED = 0x04,  // 2
	FPS1_CTL_TAPE_ENDED = 0x08,  // 3
	FPS1_COVER_OPENED = 0x10,  // 4 
	FPS1_PAPER_SKIPPING = 0x20,  // 5
	FPS1_BUFFER_NOTEMPTY = 0x40,  // 6

	FPS2_CHECK_STATE = 0x0F, // CHECK_STATUS (0..3)
	FPS2_RETCHECK_OPENED = 0x10, // 4

	FPS3_SECURITY_ERROR = 0x01, // 0
	FPS3_SIM_ERROR = 0x02, // 1
};

#define EMPTY_PARAM L"000000;"

CFiscalPrinter_Datecs3141::CFiscalPrinter_Datecs3141()
	: CFiscalPrinter_DatecsBase(), m_nLastCheckNo(0), m_nLastZReportNo(0),
	m_payModeCash(L'0'), m_payModeCard(L'2'), m_payModeCredit(L'-'),
	m_vatTaxGroup20(L'0'), m_novatTaxGroup(L'1'), m_vatTaxGroup7(L'2'),
	m_bKrypton(FALSE)
{
}


// virtual 
bool CFiscalPrinter_Datecs3141::PrintDiagnostic()
{
	try {
		CreateCommand(FPCMD_OPENNONFISCAL, EMPTY_PARAM);
		SendCommand();

		CreateCommand(FPCMD_PRINTDIAG, L"000000;0;"); /*0 - tech info*/
		SendCommand();

		CreateCommand(FPCMD_CLOSEFISCAL, L"000000;0;");
		SendCommand();

	}
	catch (CFPException ex) {
		ex.ReportError2();
		return false;
	}
	return true;
}

// virtual 
bool CFiscalPrinter_Datecs3141::PeriodicalByNo(BOOL Short, LONG From, LONG To)
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
	catch (CFPException ex)
	{
		ex.ReportError2();
		return false;
	}
	*/
	return true;
}

// virtual 
/*
bool CFiscalPrinter_Datecs3141::PeriodicalByDate(BOOL Short, COleDateTime From, COleDateTime To)
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
	catch (CFPException ex)
	{
		ex.ReportError2();
		return false;
	}
	return true;
}
*/

// virtual 
bool CFiscalPrinter_Datecs3141::ReportByArticles()
{
	try
	{
		CreateCommand(FPCMD_OPENNONFISCAL, EMPTY_PARAM);
		SendCommand();
		
		wchar_t buff[MAX_COMMAND_LEN];
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"%s%s", EMPTY_PARAM, L"0;999999;");

		CreateCommand(FPCMD_ARTICLEREPORT, buff);
		SendCommand();

		CreateCommand(FPCMD_CLOSEFISCAL, L"000000;0;");
		SendCommand();
		GetPrinterLastCheckNo(m_nLastCheckNo, true); // получим ID чека
	}
	catch (CFPException ex)
	{
		ex.ReportError2();
		return false;
	}
	return true;
}

// virtual 
bool CFiscalPrinter_Datecs3141::ReportModemState()
{
	try
	{
		// print without service document!
		wchar_t buff[MAX_COMMAND_LEN];
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"%s%s", EMPTY_PARAM, L"1;"); //1 - print report
		CreateCommand(FPCMD_MODEMSTATEREP, buff);
		SendCommand();
		GetPrinterLastCheckNo(m_nLastCheckNo, true); // get bill ID
	}
	catch (CFPException ex)
	{
		ex.ReportError2();
		return false;
	}
	return true;
}

// virtual 
bool CFiscalPrinter_Datecs3141::ProgramOperator(LPCWSTR Name, LPCWSTR Password)
{
	return true;
}

// virtual 
bool CFiscalPrinter_Datecs3141::Beep()
{
	try
	{
		CreateCommand(FPCMD_BEEP, L"000000;2;"); /*1-KEY;2-OK;3-WARN;4-ERROR*/
		SendCommand();
	}
	catch (CFPException ex)
	{
		// не показываем ошибку
		return false;
	}
	return false;
}

// virtual 
bool CFiscalPrinter_Datecs3141::NullCheck(bool bOpenCashDrawer)
{
	int op = 1; // %%%%TODO: OPERATOR/TERMINAL
	int tno = 1;
	try {
		wchar_t buff[MAX_COMMAND_LEN];
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"%s%02d;%01d;0;", EMPTY_PARAM, op, tno);
		CreateCommand(FPCMD_OPENFISCAL, buff);
		SendCommand();

		// Напечатать итог
		CreateCommand(FPCMD_PRINTTOTAL, L"000000;0;");
		SendCommand();

		CreateCommand(FPCMD_PAYMENT, L"000000;0;0.00;");
		SendCommand();

		CloseFiscal(m_nLastCheckNo);

		if (bOpenCashDrawer)
		{
			CreateCommand(FPCMD_CASHDRAWER, EMPTY_PARAM);
			SendCommand();
		}

	}
	catch (CFPException ex) {
		ex.ReportError2();
		return false;
	}
	return true;
}

/*
	  Маска разрешений для формы оплаты
		bit 0. Разрешение использования при продаже
		bit 1. Разрешение использования при возврате
		bit 7. Разрешение начисления сдачи наличными
*/

void CFiscalPrinter_Datecs3141::GetPrinterPayModes()
{
	/*
	CString s;
	CString info;
	CString r;
	bool bSetCash = false;
	bool bSetCard = false;
	bool bSetCredit = false;
	DWORD dwCardFlags = 0;
	for (int i = 0; i < 9; i++)
	{
		s.Format(L"000000;%d;", i);
		CreateCommand(PFCMD_GETPAYMODE, s);
		SendCommand();
		info = (LPCSTR)m_data;  // ANSI!
		TraceINFO(L"RCV:%s", info);

		if (AfxExtractSubString(r, info, 2, L';'))
		{
			r.MakeUpper();
			if ((r == L"ГОТІВКА") || (r == L"НАЛИЧНЫЕ") || (r == L"ГРОШІ")) {
				if (!bSetCash)
				{
					m_payModeCash = L'0' + i;
					bSetCash = true;
				}
			}
			else if ((r == L"КАРТКА") || (r == L"КАРТА") || (r == L"КАРТОЧКА")) {
				if (!bSetCard)
				{
					m_payModeCard = L'0' + i;
					bSetCard = true;
					CString f;
					if (AfxExtractSubString(f, info, 1, L';'))
					{
						int val = 0;
						if (swscanf_s(f, L"%02x", &val) == 1)
							dwCardFlags = (DWORD)val;
					}
				}
			}
			else if ((r == L"КРЕДИТ") || (r == L"КРЕДІТ")) {
				if (!bSetCredit)
				{
					m_payModeCredit = L'0' + i;
					bSetCredit = true;
				}
			}
		}
		if (bSetCard && bSetCash && bSetCredit)
			break;
	}
	TraceINFO(L"Оплата готівкою. Код оплаты: %C", m_payModeCash);
	TraceINFO(L"Оплата карткою. Код оплаты: %C", m_payModeCard);
	TraceINFO(L"Оплата в кредит. Код оплаты: %C", m_payModeCredit);
	if (!bSetCard)
		AfxMessageBox(L"Фискальный регистратор.\nНе найдена форма оплаты КАРТА (КАРТОЧКА, КАРТКА).\nПерепрограммируйте принтер.");
	/ * БИТЫ ДЛЯ ФЛАЖКОВ
	0. Разрешение использования при продаже
	1. Разрешение использования при возврате
	7. Разрешение начисления сдачи наличными
	* /
	if ((dwCardFlags & 0x02) == 0)
		AfxMessageBox(L"Фискальный регистратор.\nДля формы оплаты КАРТА запрещены возвраты.\nПерепрограммируйте принтер.");
	*/
}

void CFiscalPrinter_Datecs3141::GetTaxRates()
{
	/*
	CString info;
	CString s;
	CString r;
	bool bVatSet = false;
	bool bNoVatSet = false;
	bool bVat7Set = false;
	for (int i = 0; i < 5; i++)
	{
		s.Format(L"000000;%d;", i);
		CreateCommand(FPCMD_GETTAXRATE, s);
		SendCommand();
		info = (LPCSTR)m_data; // ANSI!
		TraceINFO(L"RCV:%s", info);
		if (AfxExtractSubString(r, info, 2, L';'))
		{
			if (r == L"20.00")
			{
				// первый с НДС
				if (!bVatSet)
				{
					m_vatTaxGroup20 = L'0' + i;
					bVatSet = true;
				}
			}
			else if (r == L"7.00")
			{
				if (!bVat7Set)
				{
					m_vatTaxGroup7 = L'0' + i;
					bVat7Set = true;
				}
			}
			else if (r == L"0.00")
			{
				if (!bNoVatSet) {
					m_novatTaxGroup = L'0' + i;
					bNoVatSet = true;
				}
			}
		}
		if (bVatSet && bNoVatSet)
			break;
	}
	TraceINFO(L"Ставка НДС 20%%. Код налога: %C", m_vatTaxGroup20);
	TraceINFO(L"Ставка НДС 7%%. Код налога: %C", m_vatTaxGroup7);
	TraceINFO(L"Ставка НДС 0%%. Код налога: %C", m_novatTaxGroup);
	*/
}


// virtual 
bool CFiscalPrinter_Datecs3141::Init(__int64 termId)
{
	try {
		// сначала получить статус (с допечаткой буфера)
		GetPrinterLastZReportNo(termId, m_nLastZReportNo);
		GetPrinterLastCheckNo(m_nLastCheckNo, false); // чтобы обработался статус

		GetPrinterPayModes();
		GetTaxRates();

		// last article
		CHECK_STATUS cs = GetCheckStatus();
		if (cs == CHS_NORMAL)
		{
			// CheckPrinterSession(); 24 часа Z-отчета?
			//TODO::CHECK_INFO::TestFix(termId, m_nLastCheckNo);
			return true;
		}

		CancelCheckPrinter();
		GetPrinterLastCheckNo(m_nLastCheckNo, false); // еще раз
		// CheckPrinterSession(); 24 часа Z-отчета?
		//TODO::CHECK_INFO::TestFix(termId, m_nLastCheckNo);
	}
	catch (CFPException ex)
	{
		ex.ReportError2();
		return false;
	}
	return true;
}

// virtual 
bool CFiscalPrinter_Datecs3141::CopyCheck()
{
	try
	{
		long checkNo = -1;
		CreateCommand(FPCMD_DAYCOUNTERS, L"000000;5;"); // останній доступний чек в копії
		SendCommand();
		/*
		USES_CONVERSION;
		CString info = A2W((char*)m_data);
		TraceINFO(L"RCV:%s", info);
		CString r;
		if (!AfxExtractSubString(r, info, 1, L';'))
			return false;
		checkNo = _wtol(r); //%%%% - 1; // выдается ТЕКУЩИЙ чек
		if (checkNo == -1)
			return false; // НЕТ ДОСТУПНЫХ ЧЕКОВ
		//if (!GetPrinterLastCheckNo(checkNo, true))
			//return false;
		CreateCommand(FPCMD_OPENNONFISCAL, EMPTY_PARAM);
		SendCommand();
		*/
		wchar_t buff[MAX_COMMAND_LEN];
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"%s%ld;%ld;", EMPTY_PARAM, checkNo, checkNo);
		CreateCommand(FPCMD_PRINTCOPY, buff);
		SendCommand();
		CloseFiscal(m_nLastCheckNo);
	}
	catch (CFPException ex) {
		ex.ReportError2();
		return false;
	}
	return true;
}

// virtual 
void CFiscalPrinter_Datecs3141::CheckStatus()
{
	//FPS1_CHK_TAPE_ENDING  = 0x01,  // 0
	//FPS1_CTL_TAPE_ENDING  = 0x02,  // 1
	//FPS1_CHK_TAPE_ENDED   = 0x04,  // 2
	//FPS1_CTL_TAPE_ENDED   = 0x08,  // 3

	if (m_status[1] & FPS1_CHK_TAPE_ENDED)
		m_bEndOfTape = true;
	if (m_status[1] & FPS1_CTL_TAPE_ENDED)
		m_bEndOfTape = true;
	if ((m_status[0] & FPS0_PRINTER_NOTRDY) != 0) {
		ThrowLastError();
	}
	else if (m_dwError != 0) {
		ThrowLastError(); // напечатается все равно последняя ошибка
	}
}

// virtual 
bool CFiscalPrinter_Datecs3141::CancelCheckCommand(__int64 termId)
{
	CHECK_STATUS cs = GetCheckStatus();
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
	catch (CFPException ex) {
		ex.ReportError2();
		return false;
	}
	*/
	return true;
}

// virtual 
bool CFiscalPrinter_Datecs3141::CancelCheck(__int64 termId, bool& bClosed)
{
	try
	{
		bClosed = false;
		CancelCheckPrinter();
	}
	catch (CFPException e)
	{
		m_strError = e.GetError(); // без сообщения
		return false;
	}
	return true;
}

void CFiscalPrinter_Datecs3141::CancelCheckPrinter()
{
	CHECK_STATUS cs = GetCheckStatus();
	if (cs == CHS_NORMAL)
		return;
	else if (cs == CHS_NF_OPENED)
	{
		CreateCommand(FPCMD_CLOSEFISCAL, L"000000;0;");
		SendCommand();
	}
	else {
		CreateCommand(FPCMD_CANCELRECEIPT, L"000000;0;");
		SendCommand();
	}
}

// virtual 
void CFiscalPrinter_Datecs3141::GetErrorCode()
{
	m_dwError = 0;
	char errCode[5];
	errCode[0] = m_rcvBuffer[4]; // cchar!
	errCode[1] = m_rcvBuffer[5];
	errCode[2] = m_rcvBuffer[6];
	errCode[3] = m_rcvBuffer[7];
	errCode[4] = '\0'; // ansi!
	DWORD dwError = strtol(errCode, NULL, 16);
	if (dwError != 0) {
		m_dwError = dwError;
	}
}

// virtual 
bool CFiscalPrinter_Datecs3141::OpenCheck(LPCWSTR szDepartmentName, __int64 termId)
{
	int op = 1; // %%%%TODO: OPERATOR/TERMINAL
	int tno = 1;
	try {
		std::wstring info;
		CancelCheckPrinter();
		OpenFiscal(op, L"", tno, info);
	}
	catch (CFPException e)
	{
		m_strError = e.GetError(); // без сообщения
		return false;
	}
	return true;
}

// virtual 
bool CFiscalPrinter_Datecs3141::OpenReturnCheck(LPCWSTR szDepartmentName, __int64 termId, long checkNo)
{
	int op = 1; // %%%%TODO: OPERATOR/TERMINAL
	int tno = 1;
	try {
		std::wstring info;
		CancelCheckPrinter();
		OpenFiscalReturn(op, L"", tno, info);
	}
	catch (CFPException e)
	{
		m_strError = e.GetError();  // без сообщения
		return false;
	}
	return true;
}

CHECK_STATUS CFiscalPrinter_Datecs3141::GetCheckStatus()
{
	return (CHECK_STATUS)(m_status[2] & FPS2_CHECK_STATE);
}

// virtual 
void CFiscalPrinter_Datecs3141::SetCurrentTime()
{
	try
	{
		/* TODO:
		COleDateTime dt = COleDateTime::GetCurrentTime();
		CString s;
		s.Format(L"%s%02d%02d%02d;%02d%02d;", EMPTY_PARAM, dt.GetDay(), dt.GetMonth(), dt.GetYear() - 2000, dt.GetHour(), dt.GetMinute());
		CreateCommand(FPCMD_SETDATETIME, s);
		SendCommand();
		*/
	}
	catch (CFPException ex)
	{
		ex.ReportError2();
	}
}

// virtual 
void CFiscalPrinter_Datecs3141::DisplayDateTime()
{
}

// virtual 
void CFiscalPrinter_Datecs3141::DisplayClear()
{
	DisplayRow(0, L"");
	DisplayRow(1, L"");
}

// virtual 
void CFiscalPrinter_Datecs3141::DisplayRow(int nRow, LPCTSTR szString)
{
	/*
	CString txt(szString ? szString : EMPTYSTR);
	txt.Replace(L'\t', L' '); // Табуляция не поддерживается
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
	catch (CFPException ex)
	{
		// do nothing
		TraceERROR(L"DisplayRow exception (%s)", ex.GetError().c_str());
	}
	*/
}

// virtual 
/*
bool CFiscalPrinter_Datecs3141::GetCash(__int64 termId, COleCurrency& cy)
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
	catch (CFPException ex)
	{
		ex.ReportError2();
		return false;
	}
	return true;
}
*/

// virtual 
/*
bool CFiscalPrinter_Datecs3141::FillZReportInfo(ZREPORT_INFO& zri)
{
	try {
		// 0 - ix = номер налога
		// 1 - ix = номер налога
		// 2 - ix = номер формы оплаты
		// 3 - ix = 1 // всегда касса
		int vatNo20 = (m_vatTaxGroup20 - L'0');
		int vatNo7 = (m_vatTaxGroup7 - L'0');
		int noVatNo = (m_novatTaxGroup - L'0');
		int payCash = (m_payModeCash - L'0');
		int payCard = (m_payModeCard - L'0');

		int vatNo = vatNo20; // пока так

		GetDaySum(0, noVatNo, zri.m_sum_nv, zri.m_ret_sum_nv); // Продажи,возвраты - БЕЗ НДС
		if (noVatNo != vatNo)
		{
			// если равны, значит НДС не запрограммирован! - НДС-продаж НЕ БЫЛО
			GetDaySum(0, vatNo, zri.m_sum_v, zri.m_ret_sum_v); // Продажи,возвраты - С НДС
			GetDaySum(1, vatNo, zri.m_vsum, zri.m_ret_vsum);   // Продажи, возвраты - НДС
		}

		GetDaySum(2, payCash, zri.m_pay0, zri.m_ret0);   // Оплаты, возвраты (0 - наличные)
		GetDaySum(2, payCard, zri.m_pay1, zri.m_ret1);   // Оплаты, возвраты (2 - карточка)
		if (m_payModeCredit != L'-')
		{
			int payCredit = (m_payModeCredit - L'0');
			GetDaySum(2, payCredit, zri.m_pay2, zri.m_ret2); // Оплаты, возвраты (3 - кредит)
		}

		CY dummy;
		dummy.int64 = 0I64;
		GetDaySum(3, 0, zri.m_cash, dummy);	            // В кассе
		GetDaySum(3, 1, zri.m_cash_in, zri.m_cash_out); // Внос, вынос

		// абсолютные значения для возвратов и выноса
		zri.m_cash_out.int64 = _abs64(zri.m_cash_out.int64);
		zri.m_ret0.int64 = _abs64(zri.m_ret0.int64);
		zri.m_ret1.int64 = _abs64(zri.m_ret1.int64);
		zri.m_ret2.int64 = _abs64(zri.m_ret2.int64);
		zri.m_ret_sum_v.int64 = _abs64(zri.m_ret_sum_v.int64);
		zri.m_ret_sum_nv.int64 = _abs64(zri.m_ret_sum_nv.int64);
		zri.m_ret_vsum.int64 = _abs64(zri.m_ret_vsum.int64);
	}
	catch (CFPException ex)
	{
		ex.ReportError2();
		return false;
	}
	return true;
}
*/

// virtual 
int CFiscalPrinter_Datecs3141::GetLastCheckNo(__int64 termId, bool bFromPrinter /*= false*/)
{
	if (bFromPrinter)
		GetPrinterLastCheckNo(m_nLastCheckNo, false);
	return m_nLastCheckNo;
}

// virtual 
LONG CFiscalPrinter_Datecs3141::GetCurrentZReportNo(__int64 termId, bool bFromPrinter /*= false*/)
{
	if (bFromPrinter)
		GetPrinterLastZReportNo(termId, m_nLastZReportNo);
	return m_nLastZReportNo;
}

bool CFiscalPrinter_Datecs3141::CheckPaymentSum(int get)
{
	/*
	Защита от неправильных сумм по артикулам.
	Если полученная сумма меньше суммы по чеку, то принтер "зависнет"
	*/
	wchar_t buff[MAX_COMMAND_LEN];
	swprintf_s(buff, MAX_COMMAND_LEN - 1, L"%s3;1;", EMPTY_PARAM); // источник 3, значение  1 = сумма по чеку
	CreateCommand(FPCMD_GETFISCTRANS, buff);
	SendCommand();
	/*
	CString info;
	info = (LPCSTR)m_data; // ANSI!
	TraceINFO(L"RCV:%s", info);
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
bool CFiscalPrinter_Datecs3141::PrintFiscalText(LPCWSTR szText)
{
	int max_len = 75;
	// Не более len символов
	/*
	CString text(szText);
	if (text.IsEmpty())
		return true; // все в порядке, пустая строка
	text.Replace(L";", L","); // ТОЧКА С ЗАПЯТОЙ - РАЗДЕЛИТЕЛЬ!!!!
	if (text.GetLength() > max_len)
		text = text.Left(max_len);
	wchar_t buff[MAX_COMMAND_LEN];
	swprintf_s(buff, MAX_COMMAND_LEN - 1, L"%s%s;", EMPTY_PARAM, (LPCWSTR)text);
	try
	{
		CreateCommand(FPCMD_PRINTTEXT, buff);
		SendCommand();
	}
	catch (CFPException ex)
	{
		m_strError = ex.GetError(); // без сообщения
		return false;
	}
	*/
	return true;
}

// virtual 
DWORD CFiscalPrinter_Datecs3141::GetFlags()
{
	DWORD dw = CFiscalPrinterImpl::FP_SYNCTIME;
	if (m_bKrypton)
		dw |= CFiscalPrinterImpl::FP_MODEMSTATE;
	return dw;
}

/*
bool CFiscalPrinter_Datecs3141::CloseCheck(int sum, int get, CFiscalPrinter::PAY_MODE pm, const wchar_t* szText /*= nullptr* /)
{
	USES_CONVERSION;
	try
	{
		if (!CheckPaymentSum(sum))
		{
			// отменяем ЧЕК
			CreateCommand(FPCMD_CANCELRECEIPT, L"000000;0;");
			SendCommand();
			throw CFPException(L"Внтутренняя ошибка фискального регистратора\nТекущий чек анулирован.\nОбратитесь к администратору системы.");
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
	catch (CFPException e) {
		m_strError = e.GetError();  // без сообщения
		return false;
	}
	return true;
}
*/

// virtual 
bool CFiscalPrinter_Datecs3141::AddArticle(__int64 termId, __int64 artId, LPCWSTR szName, __int64 vtid, long price)
{
	int art = (int)artId;
	int code = 0;
	//TODO::if (m_mapCodes.Lookup(art, code))
		//return true;
	try
	{
		AddPrinterArticle(art, szName, (vtid == 2) ? true : false);
		//m_mapCodes.SetAt(art, art);
	}
	catch (CFPException e)
	{
		m_strError = e.GetError();  // без сообщения
		return false;
	}
	return true;
}

// virtual 
/*
bool CFiscalPrinter_Datecs3141::PrintCheckItem(const CFPCheckItemInfo& info)
{
	try
	{
		int code = GetPrintCodeByArticle(info.m_art, info.m_name);
		PrintItem(code, info.m_iQty, info.m_fQty, info.m_price, info.m_dscPercent, info.m_dscSum, info.m_bIsWeight);
	}
	catch (CFPException e)
	{
		m_strError = e.GetError();  // без сообщения
		return false;
	}
	return true;
}
*/

void CFiscalPrinter_Datecs3141::OpenFiscal(int opNo, LPCTSTR /*pwd*/, int tNo, std::wstring& info)
{
	wchar_t buff[MAX_COMMAND_LEN];
	swprintf_s(buff, MAX_COMMAND_LEN - 1, L"%s%02d;%02d;0;", EMPTY_PARAM, opNo, tNo);
	CreateCommand(FPCMD_OPENFISCAL, buff);
	SendCommand();
}


void CFiscalPrinter_Datecs3141::OpenFiscalReturn(int opNo, LPCTSTR /*pwd*/, int tNo, std::wstring& info)
{
	wchar_t buff[MAX_COMMAND_LEN];
	swprintf_s(buff, MAX_COMMAND_LEN - 1, L"%s%02d;%02d;1;", EMPTY_PARAM, opNo, tNo);
	CreateCommand(FPCMD_OPENFISCAL, buff);
	SendCommand();
}

/*
bool CFiscalPrinter_Datecs3141::GetDaySum(long src, long ix, CY& value1, CY& value2)
{
	value1.int64 = 0I64;
	value2.int64 = 0I64;
	wchar_t buff[MAX_COMMAND_LEN];
	swprintf_s(buff, MAX_COMMAND_LEN - 1, L"000000;%ld;%ld;0;", src, ix);
	CreateCommand(FPCMD_DAYSUMS, buff);
	SendCommand();
	USES_CONVERSION;
	CString info = A2W((char*)m_data);
	TraceINFO(L"RCV:%s", info);
	CString r1;
	CString r2;
	if (!AfxExtractSubString(r1, info, 1, L';'))
		return false;
	if (!AfxExtractSubString(r2, info, 2, L';'))
		return false;

	COleCurrency cy1 = CConvert::String2Currency(r1);
	COleCurrency cy2 = CConvert::String2Currency(r2);
	value1 = (CY)cy1;
	value2 = (CY)cy2;
	return true;
}
*/

void CFiscalPrinter_Datecs3141::PrintTotal()
{
	// Напечатать итог
	CreateCommand(FPCMD_PRINTTOTAL, L"000000;0;");
	SendCommand();
}

void CFiscalPrinter_Datecs3141::Payment(WCHAR mode, int sum, std::wstring& info)
{
	int sum1 = sum / 100;
	int sum2 = sum % 100;
	wchar_t buff[MAX_COMMAND_LEN];
	swprintf_s(buff, MAX_COMMAND_LEN - 1, L"%s%c;%d.%02d;", EMPTY_PARAM, mode, sum1, sum2);
	CreateCommand(FPCMD_PAYMENT, buff);
	SendCommand();
}

void CFiscalPrinter_Datecs3141::CloseFiscal(long& chNo)
{
	//USES_CONVERSION;
	wchar_t buff[MAX_COMMAND_LEN];
	swprintf_s(buff, MAX_COMMAND_LEN - 1, L"%s0;", EMPTY_PARAM);
	CreateCommand(FPCMD_CLOSEFISCAL, buff);
	SendCommand();
	/*
	CString res = A2W((char*)m_data);
	TraceINFO(L"RCV:%s", res);
	CString info;
	AfxExtractSubString(info, res, 1, L';');
	if (info.GetLength() > 9)
		info = info.Left(9);
	chNo = _ttol(info);
	*/
}

// virtual
bool CFiscalPrinter_Datecs3141::XReport()
{
	try {
		wchar_t buff[MAX_COMMAND_LEN];
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"%s1;", EMPTY_PARAM);
		CreateCommand(FPCMD_DAYREPORTS, buff);
		SendCommand();
		GetPrinterLastCheckNo(m_nLastCheckNo, true); // получим ID чека
	}
	catch (CFPException ex) {
		ex.ReportError2();
		return false;
	}
	return true;
}


// virtual 
bool CFiscalPrinter_Datecs3141::ZReport()
{
	try {
		wchar_t buff[MAX_COMMAND_LEN];
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"%s0;", EMPTY_PARAM);
		CreateCommand(FPCMD_DAYREPORTS, buff);
		SendCommand();
		GetPrinterLastCheckNo(m_nLastCheckNo, true); // get bill id
	}
	catch (CFPException ex) {
		ex.ReportError2();
		return false;
	}
	return true;
}

// virtual 
bool CFiscalPrinter_Datecs3141::ServiceInOut(__int64 sum, __int64 hid)
{
	//long inCash = -1; // %%%%%
	int op = 1; // %%%%%
	bool bNeg = false;
	if (sum < 0) {
		bNeg = true;
		sum = -sum;
	}
	wchar_t buff[MAX_COMMAND_LEN];
	if (bNeg)
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"%s%d;-%d.%02d;", EMPTY_PARAM, (int)op, (int)(sum / 100), (int)(sum % 100));
	else
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"%s%d;%d.%02d;", EMPTY_PARAM, (int)op, (int)(sum / 100), (int)(sum % 100));
	try {
		CreateCommand(FPCMD_SVCINOUT, buff);
		SendCommand();
		GetPrinterLastCheckNo(m_nLastCheckNo, true); // get bill id

		CreateCommand(FPCMD_CASHDRAWER, EMPTY_PARAM);
		SendCommand();

	}
	catch (CFPException ex)
	{
		ex.ReportError2();
		return false;
	}
	return true;
}

void CFiscalPrinter_Datecs3141::PrintItem(int code, int qty, double fQty, int price, int dscPrc, int dscSum, bool bIsWeight)
{
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
	* /
	CreateCommand(FPCMD_PRINTITEM, s);
	SendCommand();
	if (dscPrc != 0)
	{
		ATLASSERT(dscSum == 0);
		s.Format(L"%s-%d.%02d;", EMPTY_PARAM, dscPrc / 100, dscPrc % 100);
		CreateCommand(FPCMD_DISCOUNTPRCNT, s);
		SendCommand();
	}
	else if (dscSum != 0)
	{
		ATLASSERT(dscPrc == 0);
		s.Format(L"%s-%d.%02d;", EMPTY_PARAM, dscSum / 100, dscSum % 100);
		CreateCommand(FPCMD_DISCOUNTABS, s);
		SendCommand();
	}
	*/
}

int CFiscalPrinter_Datecs3141::GetPrintCodeByArticle(__int64 art, LPCWSTR szName)
{
	int code = 0;
	//if (m_mapCodes.Lookup(art, code))
		//return code;
	_ASSERT(FALSE);
	return (int)art;
}

void CFiscalPrinter_Datecs3141::AddPrinterArticle(int code, LPCWSTR szName, bool bVat)
{
	//%%%%TODO: TERMINAL
	/*
	int tno = 1;
	USES_CONVERSION;
	CString strFind;
	strFind.Format(L"%s%ld;", EMPTY_PARAM, code);
	CreateCommand(PFCMD_FINDARTICLE, strFind);
	SendCommand();
	CString find = A2W((char*)m_data);
	TraceINFO(L"RCV:%s", find);
	if (find.Find(L"FFFFFF") == -1)
		return; // уже запрограммирован

	CString name(szName);
	name.Replace(L";", L","); // ТОЧКА С ЗАПЯТОЙ - РАЗДЕЛИТЕЛЬ!!!!
	if (name.GetLength() > 75)
		name = name.Left(75);
	_ASSERT(name.GetLength() <= 75);
	CString unit(L"");

	/ *
	CString strUnit(unit);
	if (strUnit.GetLength() > 6)
		strUnit = strUnit.Left(6); // не более 6 символов
	* /

	CString s;
	s.Format(L"%s%ld;%s;%c;%ld;00;%s;",
		EMPTY_PARAM, (long)code, (LPCWSTR)name, bVat ? m_vatTaxGroup20 : m_novatTaxGroup,
		(long)tno, (LPCWSTR)unit);
	//00-модификатор весового товара
	CreateCommand(FPCMD_ADDARTICLE, s);
	SendCommand();
	if (IsDebugMode())
	{
		USES_CONVERSION;
		CString info = A2W((char*)m_data);
		TraceINFO(L"RCV:%s", info);
	}
	*/
}

bool CFiscalPrinter_Datecs3141::GetPrinterLastZReportNo(__int64 termId, long& zNo)
{
	CreateCommand(FPCMD_DAYCOUNTERS, L"000000;0;");
	SendCommand();
	/*
	USES_CONVERSION;
	CString info = A2W((char*)m_data);
	TraceINFO(L"RCV:%s", info);
	CString r;
	if (!AfxExtractSubString(r, info, 1, L';'))
		return false;
	zNo = _ttol(r);
	if (zNo == 0)
	{
		// ПРИНТЕР НЕ ФИСКАЛИЗИРОВАН, вернем значение из БД
		__int64 no = ZREPORT_INFO::GetTestNumber(termId);
		if (no == 0)
			return false;
		zNo = (LONG)no;
	}
	*/
	return true;
}

bool CFiscalPrinter_Datecs3141::GetPrinterLastCheckNo(long& chNo, bool bShowStateError /*= true*/)
{
	CreateCommand(FPCMD_DAYCOUNTERS, L"000000;3;");
	SendCommand();
	/*
	USES_CONVERSION;
	CString info = A2W((char*)m_data);
	TraceINFO(L"RCV:%s", info);
	CString r;
	if (!AfxExtractSubString(r, info, 1, L';'))
		return false;
	chNo = _ttol(r); //%%%% - 1; // выдается ТЕКУЩИЙ чек
	if (!m_bKrypton)
		chNo--;  // почему-то в 3141 ошибка
	CHECK_STATUS cs = GetCheckStatus();
	if (cs != CHS_NORMAL)
	{
		if (bShowStateError)
			AfxMessageBox(L"Ошибка состояния чека.\nАннулируйте текущий чек", NULL, MB_ICONEXCLAMATION);
		return false;
	}
	*/
	return true;
}

// virtual 
bool CFiscalPrinter_Datecs3141::OpenCashDrawer()
{
	try {
		CreateCommand(FPCMD_CASHDRAWER, EMPTY_PARAM);
		SendCommand();
	}
	catch (CFPException ex) {
		ex.ReportError2();
		return false;
	}
	return true;
}

static void _append(std::wstring& s, const wchar_t* szAdd)
{
	if (!s.empty())
		s += L"\n";
	s += szAdd;
};

std::wstring CFiscalPrinter_Datecs3141::GetLastErrorS()
{
	std::wstring s(L"");

	// или или
	if (m_status[1] & FPS1_CHK_TAPE_ENDED)
		_append(s, L"Закончилась чековая лента");
	else if (m_status[1] & FPS1_CHK_TAPE_ENDING)
		_append(s, L"Заканчивается чековая лента");

	// или или
	if (m_status[1] & FPS1_CTL_TAPE_ENDING)
		_append(s, L"Заканчивается контрольная лента");
	else if (m_status[1] & FPS1_CTL_TAPE_ENDED)
		_append(s, L"Закончилась контрольная лента");

	if (m_status[0] & FPS0_NO_DISPLAY)
		_append(s, L"Не подключен дисплей покупателя");

	if (m_dwError == 0)
		return s;
	if (m_dwError == err_NOT_CONNECTED) {
		_append(s, L"Невозможно подключиться к фискальному регистратору. Проверьте скорость порта.");
	}
	else if (m_dwError == 0x0002) {
		_append(s, L"Неправильный код инструкции");
	}
	else if (m_dwError == 0x000b) {
		_append(s, L"Ошибка состояния чека");
	}
	else if (m_dwError == 0x0405) {
		_append(s, L"Переход через сутки. Сделайте Z-отчет");
	}
	else if (m_dwError == 0x0705) {
		_append(s, L"Фискальный принтер не фискализирован.\nВыполнить операцию невозможно");
	}
	else if (m_dwError == 0x0905) {
		_append(s, L"С начала смены прошло более 24-х часов. Сделайте Z-отчет");
	}
	else if (m_dwError == 0x0A05) {
		_append(s, L"Необходимо скорректировать время");
	}
	else if (m_dwError == 0x080B) {
		_append(s, L"В кассе недостаточно денежных средств");
	}
	else if (m_dwError == 0x070B) {
		_append(s, L"Копия заданных чеков недоступна");
	}
	else if ((m_dwError & 0xFF03) != 0) {
		wchar_t buff[MAX_COMMAND_LEN];
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"Ошибка в команде (формат аргумента %d)", (int)(m_dwError & 0xFF00 >> 8));
		_append(s, buff);
	}
	else if ((m_dwError & 0xFF04) != 0) {
		wchar_t buff[MAX_COMMAND_LEN];
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"Ошибка в команде - (значение аргумента %d)", (int)(m_dwError & 0xFF00 >> 8));
		_append(s, buff);
	}
	else {
		wchar_t buff[MAX_COMMAND_LEN];
		swprintf_s(buff, MAX_COMMAND_LEN - 1, L"Общая ошибка принтера: 0x%x", (int)m_dwError);
		_append(s, buff);
	}


	return s;
}

void CFiscalPrinter_Datecs3141::ReportError(CFPException& ex)
{
	std::wstring s = GetLastErrorS();
	if (s.empty())
	{
		ex.ReportError2();
		return;
	}
	/*
	if (m_bBigMsg)
		CMessageBox::DoMessageBox(s, NULL, MB_ICONHAND);
	else
		AfxMessageBox(s);
	*/
}

// virtual 
bool CFiscalPrinter_Datecs3141::IsEndOfTape()
{
	return m_bEndOfTape;
}
