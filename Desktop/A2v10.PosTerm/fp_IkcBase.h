#pragma once


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
	FP_SEND_STATUS = 0,
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
	FP_PRINTVER = 32, /*PrintVer*/
	FP_GET_CASH = 33, /*GetBox*/
	FP_DISCOUNT = 35, /*Discount*/
	FP_GETARTICLE = 41, /*GetArticle*/
	FP_GETDAYINFO = 42, /*GetDayReport*/
	FP_GETTAXRATES = 44, /*GetTaxRates*/
};

struct RCP_NO {
	long saleno;
	long retno;
	long zno;
};

class CFiscalPrinter_IkcBase : public FiscalPrinterImpl
{
public:
	CFiscalPrinter_IkcBase(const wchar_t* model);
	virtual ~CFiscalPrinter_IkcBase();

	virtual bool IsOpen() const
	{
		return m_hCom != INVALID_HANDLE_VALUE;
	}
	virtual void SetParams(const PosConnectParams& prms) override;
	virtual bool Open(const wchar_t* Port, DWORD nBaudRate) override;
	virtual void Close();

	virtual void GetStatusMessages(std::vector<std::wstring>& msgs) override;
	virtual void GetPrinterInfo(JsonObject& json) override;
	virtual void GetErrorCode() override;

	static int ConvertText(const wchar_t* szText, char* text, int bufSize, size_t maxSize);

protected:

	std::wstring _port;
	std::wstring _model;
	bool _skipErrors;
	std::unordered_map <__int64, int> _taxChars;

	virtual void CreateCommand(const wchar_t* name, FP_COMMAND cmd, BYTE* pData = NULL, int DataLen = 0);
	virtual void SendCommand();
	virtual void RecalcCrcSum();
	virtual BYTE CalcCheckSum(BYTE* pBytes, int dataLen);

	virtual void Init() override;
	virtual void AddArticle(const RECEIPT_ITEM& item) override;
	virtual bool CancelCheck(bool& bClosed);
	//virtual bool CancelCheckCommand();
	virtual SERVICE_SUM_INFO ServiceInOut(bool bOut, __currency sum, bool bOpenCashDrawer) override;
	//virtual bool GetCash(DB_ID termId, COleCurrency& cy);
	virtual long NullReceipt(bool bOpenCashDrawer) override;
	virtual long CopyReceipt() override;
	//virtual bool PrintCheckItem(const CFPCheckItemInfo& info);

	virtual void CancelOrCloseReceipt() override;
	virtual void CancelReceiptUnconditional() override;
	virtual void OpenReceipt() override;
	virtual void OpenReturnReceipt() override;
	virtual void Payment(PAYMENT_MODE mode, long sum) override;
	virtual void PrintTotal() override;
	virtual void PrintReceiptItem(const RECEIPT_ITEM& item) override;
	virtual long CloseReceipt(bool bDisplay) override;
	//virtual bool CloseCheck(int sum, int get, CFiscalPrinter::PAY_MODE pm, const wchar_t* szText = NULL);
	virtual long XReport() override;
	virtual ZREPORT_RESULT ZReport() override;
	virtual void OpenCashDrawer() override;
	virtual bool PrintDiagnostic();
	//virtual bool PeriodicalByDate(BOOL Short, COleDateTime From, COleDateTime To);
	virtual long PeriodReport(const wchar_t* report, bool bShort, const wchar_t* from, const wchar_t* to) override;
	virtual bool PeriodicalByNo(BOOL Short, LONG From, LONG To) override;
	virtual bool ReportByArticles();
	virtual bool ReportModemState() override;
	virtual std::wstring FPGetLastError() = 0;

	virtual bool IsEndOfTape();
	virtual bool PrintDiscount(LONG Type, LONG Sum, const wchar_t* szDescr);
	virtual void DisplayRow(int nRow, const wchar_t* szString, TEXT_ALIGN align) override;
	virtual void Comment(const wchar_t* szComment, int maxSize);

	virtual void PrintFiscalText(const wchar_t* szText) override;
	virtual void PrintNonFiscalText(const wchar_t* szText) override;
	virtual void SetCurrentTime() override;
	virtual void TraceCommand(const wchar_t* command) override;
	virtual void DisplayDateTime() override;
	virtual void DisplayClear() override;

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
	void GetPrinterPayModes();
	void GetPrinterTaxRates();
	int FindTaxCode(long tax, long excise);
	long GetPrinterLastZReportNo();
	void GetPrinterLastReceiptNo(RCP_NO& no);
	void DayReport_(void* Info);
	void DayReport_Tag(void* pInfo, BYTE tag, size_t infoSize);
	JsonObject FillZReportInfo();

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
	long m_nLastReceiptNo;
	long m_nLastZReportNo;

	bool m_bReturnCheck;
	bool m_bEndOfTape;
};
