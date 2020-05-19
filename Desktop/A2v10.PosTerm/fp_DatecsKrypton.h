// Copyright 3© 2015-2020 Alex Kukhtin. All rights reserved.

#pragma once

enum RECEIPT_STATUS
{
	CHS_NORMAL = 0,
	CHS_TITLED = 1,
	CHS_ITEMED = 2,
	CHS_PAYED = 3,
	CHS_CLOSING = 4,
	CHS_NF_OPENED = 5,
	CHS_DISCOUNTED = 6,
	CHS_NOTUSED = 7,
	CHS_CANCELING = 8,
	CHS_CANCELED = 9,
};

union TAX_KEY {
	struct {
		__int32 tax;
		__int32 nested;
	};
	__int64 key;
};

struct DAY_SUM {
	__currency value1;
	__currency value2;
};

class CFiscalPrinter_DatecsKrypton : public CFiscalPrinter_DatecsBase
{
	long m_nLastReceiptNo;
	long m_nLastZReportNo;
	std::unordered_map <__int64, long> _mapCodes;
	wchar_t _payModeCash;
	wchar_t _payModeCard;
	std::unordered_map <__int64, wchar_t> _taxChars;
	int _op;
	std::wstring _model;
	long _testReceiptNo;
public:
	CFiscalPrinter_DatecsKrypton(const wchar_t* model);

	virtual void SetParams(const PosConnectParams& prms) override;
	virtual void PrintDiagnostic();
	virtual bool ProgramOperator(LPCWSTR Name, LPCWSTR Password);
	virtual long NullReceipt(bool bOpenCashDrawer) override;
	virtual long XReport() override;
	virtual ZREPORT_RESULT ZReport() override;
	virtual SERVICE_SUM_INFO ServiceInOut(bool bOut, __currency sum, bool bOpenCashDrawer) override;
	virtual void OpenReceipt() override;
	virtual void OpenReturnReceipt() override;
	virtual void Payment(PAYMENT_MODE mode, long sum) override;
	virtual void PrintTotal() override;
	virtual long CloseReceipt(bool bDisplay) override;
	virtual long PeriodReport(const wchar_t* report, bool bShort, const wchar_t* from, const wchar_t* to) override;
	virtual JsonObject FillZReportInfo() override;

	//virtual bool CloseCheck(int sum, int get, CFiscalPrinter::PAY_MODE pm, LPCWSTR szText = NULL);
	virtual DWORD GetFlags();

	virtual LONG GetCurrentZReportNo(bool bFromPrinter = false) override;
	//virtual bool FillZReportInfo(ZREPORT_INFO& zri);
	//virtual bool GetCash(__int64 termId, COleCurrency& cy);
	virtual void SetCurrentTime() override;
	virtual void DisplayDateTime() override;
	virtual void DisplayClear() override;
	virtual void DisplayRow(int rowNo, LPCTSTR szString) override;
	virtual void CancelReceipt() override;

	virtual void PrintReceiptItem(const RECEIPT_ITEM& item) override;
	virtual void AddArticle(const RECEIPT_ITEM& item) override;
	virtual bool CopyReceipt() override;
	virtual void Init() override;
	virtual void OpenCashDrawer() override;
	virtual void PrintFiscalText(const wchar_t* szText) override;
	virtual void Beep() override;
	//virtual bool PeriodicalByDate(BOOL Short, COleDateTime From, COleDateTime To) override;
	virtual bool PeriodicalByNo(BOOL Short, LONG From, LONG To) override;
	virtual bool ReportByArticles() override;
	virtual bool ReportModemState() override;
	virtual bool IsEndOfTape() override;
	virtual void GetErrorCode() override;

protected:

	enum ERRORS {
		err_NOT_CONNECTED = 0xFFFF0001,
		err_NOT_NOTSYNC = 0xFFFF0002,
	};

	virtual void CheckStatus() override;
	virtual std::wstring GetLastErrorS() override;
	virtual void GetStatusMessages(std::vector<std::wstring>& msgs) override;
	virtual void GetPrinterInfo(JsonObject& json) override;

	bool CheckPaymentSum(int get);

	RECEIPT_STATUS GetReceiptStatus();

	void OpenFiscal(int opNo, LPCTSTR pwd, int tNo);
	void OpenFiscalReturn(int opNo, LPCTSTR pwd, int tNo);
	void Payment(WCHAR mode, int sum, std::wstring& info);
	long CloseFiscal(bool bDisplay);
	void AddPrinterArticle(int code, const wchar_t* name, const wchar_t*  unit, long vat, long excise);
	int GetPrintCodeByArticle(__int64 art, LPCWSTR szName);
	bool GetPrinterCheckNoForCopy(long& chNo, bool bShowStateError = true);
private:
	long GetPrinterLastReceiptNo();
	long GetPrinterLastZReportNo();
	void GetPrinterPayModes();
	void GetTaxRates();
	void TraceStatus();
	wchar_t FindTaxChar(long tax, long excise);
	TAX_KEY FindTaxKey(wchar_t tax);
	DAY_SUM GetDaySum(long src, long ix);
};
