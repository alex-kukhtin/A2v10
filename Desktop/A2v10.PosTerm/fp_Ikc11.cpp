// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "equipmentbase.h"
#include "fiscalprinter.h"
#include "fiscalprinterimpl.h"
#include "fp_IkcBase.h"
#include "fp_Ikc11.h"
#include "stringtools.h"
#include "errors.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif

CFiscalPrinter_Ikc11::CFiscalPrinter_Ikc11()
{
}

// virtual
void CFiscalPrinter_Ikc11::CreateCommand(const wchar_t* name, FP_COMMAND cmd, BYTE* pData /*= NULL*/, int DataLen /*= 0*/)
{
	TraceINFO(L"%s\r\n  SND:0x%02X %s", name, (int)cmd, _Byte2String(pData, DataLen).c_str());

	ClearBuffers();
	m_sndBuffer[0] = DLE;
	m_sndBuffer[1] = STX;
	m_sndBuffer[2] = m_nSeq; // number
	m_sndBuffer[3] = cmd; 
	for (int i=0; i<DataLen; i++)
		m_sndBuffer[4 + i] = pData[i];
	m_sndBuffer[4 + DataLen] = 0; // // checksum
	m_sndBuffer[5 + DataLen] = DLE;
	m_sndBuffer[6 + DataLen] = ETX;
	
	m_sndBuffer[4 + DataLen] = CalcCheckSum(m_sndBuffer, DataLen);

	m_bytesToSend = 7 + DataLen;
	m_LastDataLen = DataLen;
}

// virtual
void CFiscalPrinter_Ikc11::SendCommand()
{
	ReadAll(); // everything received before
	int nCount = 0;
start:
	int rcvBytes = 0;

	DWORD dwSent = 0;
	for (int i=0; i<m_bytesToSend; i++)
	{
		BYTE b = m_sndBuffer[i];
		DWORD dwByte = 0;
		if (!WriteFile(m_hCom, &b, 1, &dwByte, NULL)) 
		{
			CloseComPort();
			m_dwOsError = ::GetLastError();
			ThrowOsError(m_dwOsError);
		}
		if ((b == DLE) && (i >= 2) && (i < (m_bytesToSend - 4)))
		{
			// повторяем отправку
			if (!WriteFile(m_hCom, &b, 1, &dwByte, NULL)) {
				CloseComPort();
				m_dwOsError = ::GetLastError();
				ThrowOsError(m_dwOsError);
			}
		}
		dwSent++;
	}
	/*
	if (!WriteFile(m_hCom, m_sndBuffer, m_bytesToSend, &dwSent, NULL)) {
		CloseComPort();
		m_dwOsError = ::GetLastError();
		ThrowCommonError();
	}
	*/
	if (m_bytesToSend != dwSent) {
		ThrowInternalError(L"Invalid send bytes");
	}

read:
	BYTE buff = 0x0;
	DWORD dwRead = 0;
	int cnt = 0;
	bool bStx = false;
	while (ReadFile(m_hCom, &buff, 1, &dwRead, NULL) && (dwRead == 1)) {
		if (true) // (buff != SYN)
		{
			if (buff == STX)
				bStx = true;
			if ((!bStx) && (buff == SYN))
				continue;
			if ((!bStx) && (buff == ENQ))
				continue;
			if ((rcvBytes > 0) && (buff == DLE) && (m_rcvBuffer[rcvBytes-1] == DLE))
				continue; // двойные DLE пропускаем
			m_rcvBuffer[rcvBytes++] = buff;
		}
		else
			::Sleep(20);
	}
	
	// there can be TWO datasets
	while (ReadFile(m_hCom, &buff, 1, &dwRead, NULL) && (dwRead == 1)) 
	{
		if (true) // (buff != SYN)
		{
			if (buff == STX)
				bStx = true;
			if ((!bStx) && (buff == SYN))
				continue;
			if ((!bStx) && (buff == ENQ))
				continue;
			if ((rcvBytes > 0) && (buff == DLE) && (m_rcvBuffer[rcvBytes-1] == DLE))
				continue; // двойные DLE пропускаем
			m_rcvBuffer[rcvBytes++] = buff;

		}
		else
			::Sleep(20);
	}

	if ((rcvBytes == 0) || ((rcvBytes > 0) && (m_rcvBuffer[0] == NAK)))
	{
		// повторим отправку команды с другим SEQUENCE
		if (nCount > RETRY_COUNT)
			ThrowInternalError(L"Invalid retry count");
		IncSeq(); // чтобы это была другая команда
		RecalcCrcSum();
		nCount++;
		goto start;
	}
	
	if ((rcvBytes == 1) && (m_rcvBuffer[0] == ACK))
	{
		goto read;
	} 
	else if ((rcvBytes == 1) && (m_rcvBuffer[0] == SYN))
	{
		rcvBytes = 0;
		goto read;
	}


	BYTE rcvSeq = m_rcvBuffer[3]; // sequence
	BYTE rcvCmd = m_rcvBuffer[4]; // command

	m_RcvDataLen = rcvBytes - 11;
	// CRC - 2 bytes
	TraceINFO(L"  RCV:%s", _Byte2String(m_rcvBuffer + 8, m_RcvDataLen - 2).c_str());
	IncSeq();
	if (rcvBytes < 6)
	{
		//CString msg;
		//msg.Format(L"Invalid receive count (%d)", rcvBytes);
		//ThrowInternalError(msg);
	}
	ParseStatus();
}


// virtual
void CFiscalPrinter_Ikc11::RecalcCrcSum()
{
	m_sndBuffer[2] = m_nSeq; // number
	m_sndBuffer[4 + m_LastDataLen] = CalcCheckSum(m_sndBuffer, m_LastDataLen);
}


#pragma pack(push, 1)
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
	BYTE group1_0[6];
	BYTE group1_1[6];
	BYTE group2_0[6];
	BYTE group2_1[6];
	BYTE group3_0[6];
	BYTE group3_1[6];
	BYTE group4_0[6];
	BYTE group4_1[6];
};

#pragma pack(pop)


void CFiscalPrinter_Ikc11::DayReport_(void* Info)
{
	DAYREPORT_INFO_0* pInfo = reinterpret_cast<DAYREPORT_INFO_0*>(Info);
	CreateCommand(L"GETDAYINFO", FP_GETDAYINFO);
	SendCommand();
	GetData((BYTE*)pInfo, sizeof(DAYREPORT_INFO_0));
}

void CFiscalPrinter_Ikc11::DayReport_Tag(void* pInfo, BYTE tag, size_t infoSize)
{
	BYTE xTag = tag;
	CreateCommand(L"GETDAYINFO", FP_GETDAYINFO, &xTag, 1);
	SendCommand();
	GetData((BYTE*) pInfo, infoSize);
}

// virtual 
int CFiscalPrinter_Ikc11::GetLastCheckNo(bool bFromPrinter /*= false*/)
{
	if (bFromPrinter)
	{
		DAYREPORT_INFO_0 info = {0};
		try 
		{
			DayReport_(&info);
		} 
		catch (EQUIPException ex)
		{
			//ex.ReportError2();
			return false;
		}
		WORD ch = info.schecks; // bin
		if (m_bReturnCheck)
			ch = info.retrcpcount;
		m_nLastReceiptNo = ch;
	}
	return m_nLastReceiptNo;
}

// virtual
std::wstring CFiscalPrinter_Ikc11::FPGetLastError()
{
	// s=0, err=0
	if ((m_dwStatus == 0) && (m_dwError == 0))
		return L""; // OK
	if (m_dwStatus != 0)
	{
		if (m_dwError == 0)
		{
			if (m_dwStatus & 0x1) // bit 0
			{
				if (m_dwReserved & 0x4) // bit2
					return L"В принтере закончилась бумага";
				return L"Принтер не готов";
			}
			else if (m_dwStatus & 0x2) // bit1
				return L"Превышение продолжительности хранения данных в КЛЕФ";
			else if (m_dwStatus & 0x4) // bit2
				return L"Ошибка или переполнение фискальной памяти";
			else if (m_dwStatus & 0x8) // bit3
				return L"Неправильная дата или ошибка часов";
			else if (m_dwStatus & 0x10) // bit4
				return L"Ошибка индикатора";
			else if (m_dwStatus & 0x20) // bit5
				return L"Превышение продолжительности смены";
			else if (m_dwStatus & 0x40) // bit6
				return L"Снижение рабочего напряжения питания";
			else if (m_dwStatus & 0x80) // bit7
				return L"Команда не существует или запрещена в данном режиме";
		}
	}
	switch (m_dwError) 
	{
		case 1: return L"Ошибка принтера";
		case 2: return L"Закончилась бумага";
		case 4: return L"Сбой фискальной памяти";
		case 6: return L"снижение напряжения питания";
		case 8: return L"фискальная память переполнена"; 
		case 10: return L"Не было персонализации";
		case 16: return L"Команда запрещена в данном режиме";
		case 19: return L"Ошибка программирования логотипа";
		case 20: return L"Неправильная длина строки";
		case 21: return L"Неправильный пароль";
		case 22: return L"Несуществующий номер (пароля, строки)";
		case 23: return L"Налоговая группа не существует или не установлена, налоги не вводились";
		case 24: return L"Тип оплат не существует";
		case 25: return L"Недопустимые коды символов";
		case 26: return L"Превышение количества налогов";
		case 27: return L"Отрицательная продажа больше суммы предыдущих продаж чека";
		case 28: return L"Ошибка в описании артикула";
		case 30: return L"Ошибка формата даты/времени";
		case 31: return L"Превышение регистраций в чеке";
		case 32: return L"Превышение разрядности вычисленной стоимости";
		case 33: return L"Переполнение регистра дневного оборота";
		case 34: return L"Переполнение регистра оплат";
		case 35: return L"Сумма “выдано” больше, чем в денежном ящике";
		case 36: return L"Дата младше даты последнего z-отчета";
		case 37: return L"Открыт чек выплат, продажи запрещены";
		case 38: return L"Открыт чек продаж, выплаты запрещены";
		case 39: return L"Команда запрещена, чек не открыт";
		case 41: return L"Команда запрещена до Z-отчета";
		case 42: return L"Команда запрещена, не было чеков";
		case 43: return L"Сдача с этой оплаты запрещена";
		case 44: return L"Команда запрещена, чек открыт";
		case 45: return L"Скидки/наценки запрещены, не было продаж";
		case 46: return L"Команда запрещена после начала оплат";
		case 47: return L"Переполнение контрольной ленты";
		case 48: return L"Неправильный номер данных КЛЕФ";
		case 50: return L"Команда запрещена, КЛЕФ не пустой";
	}
	return L"Общая ошибка принтера";
}

// virtual 
JsonObject CFiscalPrinter_Ikc11::FillZReportInfo()
{
	JsonObject result;

	TraceINFO(L"DATECS [%s]. FillZReportInfo()", _id.c_str());
	DAYREPORT_INFO_0 info = {0};
	DayReport_(&info);
	long cashin = info.GetCashIn();
	long cashout = info.GetCashOut();
	long saleTax0 = info.SaleTax(0);
	long saleTax1 = info.SaleTax(1);
	long saleTax2 = info.SaleTax(2);
	long saleTax3 = info.SaleTax(3);
	long sumCard = info.SalePayment(0);
	long sumCash = info.SalePayment(2);
	long retTax0 = info.RetTax(0);
	long retTax1 = info.RetTax(1);
	long retCard = info.RetPayment(0);
	long retCash = info.RetPayment(2);


	//zri.m_cash_in = CCyT::MakeCurrency(s / 100, s % 100);
	//s = info.GetCashOut();
	//zri.m_cash_out = CCyT::MakeCurrency(s / 100, s % 100);

	DAYREPORT_INFO_TAG_1 info_1 = { 0 };
	DayReport_Tag(&info_1, 1, sizeof(DAYREPORT_INFO_TAG_1));

	DAYREPORT_INFO_TAG_0 info_0 = { 0 };
	DayReport_Tag(&info_0, 0, sizeof(DAYREPORT_INFO_TAG_0));

	return result;
}
