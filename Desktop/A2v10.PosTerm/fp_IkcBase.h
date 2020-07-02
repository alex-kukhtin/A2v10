#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_OMEXT_DATA

#define DLE 0x10
#define STX 0x02
#define ETX 0x03
#define NAK 0x15
#define SYN 0x16
#define ACK 0x06
#define ENQ 0x05

#define RETRY_COUNT 5

enum PAY_TYPE
{
	FP_PAYTYPE_CARD = 0,
	FP_PAYTYPE_CASH = 3,
	FP_PAYTYPE_NOCSH = 1,
};

enum FP_COMMAND
{
	FP_GET_DATE = 1, /*GetDate*/
	FP_SET_DATE = 2,
	FP_GET_TIME = 3, /*GetTime*/
	FP_SET_TIME = 4,
	FP_RETURN_ITEM = 8,  /*PayMoney*/
	FP_XREPORT = 9,  /*DayReport*/
	FP_REP_ART = 10, /*ArtReport*/
	FP_COMMENT = 11, /*Comment*/
	FP_ZREPORT = 13, /*DayClrReport*/
	FP_RESET_ORDER = 15, /*ResetOrder*/
	FP_SVC_IN = 16, /*Avans*/
	FP_PREP_DATE_F = 17, /*PeriodicReport*/
	FP_SALE_ITEM = 18, /*Sale*/
	FP_PAYMENT = 20, /*Payment*/
	FP_SVC_OUT = 24, /*Give*/
	FP_PREP_DATE_S = 26, /*PeriodicReportShort*/
	FP_DISPLAY_ROW = 27, /*SendCustomer*/
	FP_CASH_DRAWER = 29, /*OpenBox*/
	FP_PRINTCOPY = 30, /*PrintCopy*/
	FP_PREP_NO_F = 31, /*PeriodicReport2*/
	FP_PRINTVER = 32, /*PrintVer */
	FP_GET_CASH = 33, /* GetBox  */
	FP_DISCOUNT = 35, /* Discount */
	FP_GETDAYINFO = 42, /* GetDayReport*/
};

class CFiscalPrinter_IkcBase : public FiscalPrinterImpl
{
public:
	CFiscalPrinter_IkcBase();
	virtual ~CFiscalPrinter_IkcBase();

	virtual bool IsOpen() const
	{
		return m_hCom != INVALID_HANDLE_VALUE;
	}
	virtual bool Open(const wchar_t* Port, const wchar_t* InitInfo);
	virtual bool Open(const wchar_t* Port, DWORD nBaudRate) override;
	virtual void Close();

	static int ConvertText(const wchar_t* szText, char* text, int bufSize, int maxSize);

protected:
	virtual void CreateCommand(FP_COMMAND cmd, BYTE* pData = NULL, int DataLen = 0);
	virtual void SendCommand();
	virtual void RecalcCrcSum();
	virtual BYTE CalcCheckSum(BYTE* pBytes, int dataLen);

	virtual bool CancelCheck(bool& bClosed);
	virtual bool CancelCheckCommand();
	virtual bool ServiceInOut(__int64 sum);
	//virtual bool GetCash(DB_ID termId, COleCurrency& cy);
	virtual bool NullCheck(bool bOpenCashDrawer);
	virtual bool CopyCheck();
	virtual void Comment(const wchar_t* szComment, int maxSize);
	virtual bool PrintDiagnostic();
	//virtual bool PrintCheckItem(const CFPCheckItemInfo& info);
	virtual void OpenReceipt() override;
	//virtual bool CloseCheck(int sum, int get, CFiscalPrinter::PAY_MODE pm, const wchar_t* szText = NULL);
	virtual bool OpenReturnCheck(const wchar_t* szDepartmentName, long checkNo);
	virtual long XReport() override;
	//virtual bool ZReport();
	virtual void OpenCashDrawer() override;
	//virtual bool PeriodicalByDate(BOOL Short, COleDateTime From, COleDateTime To);
	virtual bool PeriodicalByNo(BOOL Short, LONG From, LONG To);
	virtual bool ReportByArticles();
	//virtual CString FPGetLastError();
	virtual bool IsEndOfTape();
	virtual bool PrintDiscount(LONG Type, LONG Sum, const wchar_t* szDescr);
	virtual void PrintNonFiscalText(const wchar_t* szText) override;
	virtual void DisplayRow(int nRow, const wchar_t* szString);

protected:
	bool OpenComPort(const wchar_t* strPort, int nBaud);
	void CloseComPort();
	void ClearBuffers();
	void ReadAll();
	void IncSeq();
	void ThrowCommonError();
	void ThrowInternalError(const wchar_t* szError);
	void ThrowOsError(DWORD dwOsError);
	void ParseStatus();
	void GetData(BYTE* pData, int DataLen);
	int GetCash_();
	void CheckPaperStatus();
	void Payment(LONG Sum, PAY_TYPE pt, bool bAutoClose);
	void PrintItem(const wchar_t* szName, long code, int iQty, double fQty, int price, int dscPrc, int dscSum, __int64 vtid, int nTax);

protected:
	HANDLE m_hCom;
	BYTE m_sndBuffer[256];
	BYTE m_rcvBuffer[256];
	BYTE m_status[6];
	BYTE m_data[128];
	DWORD m_dwError;
	DWORD m_dwReserved;
	DWORD m_dwOsError;
	DWORD m_dwStatus;
	int  m_sndBytes;
	int  m_rcvBytes;
	int m_bytesToSend;
	int m_RcvDataLen;
	int m_LastDataLen;
	BYTE m_nSeq;
	int  m_lastArt;
	int m_nLastReceiptNo;
	bool m_bReturnCheck;
	bool m_bEndOfTape;
};

#undef AFX_DATA
#define AFX_DATA
