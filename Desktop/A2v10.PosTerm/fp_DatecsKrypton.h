// Copyright 3© 2015-2020 Alex Kukhtin. All rights reserved.

#pragma once

enum RECEIPT_STATUS
{
	CHS_NORMAL = 0,     // закрыт
	CHS_TITLED = 1,     // отпечатан заголовок
	CHS_ITEMED = 2,     // выполнена продажа
	CHS_PAYED = 3,      // оплачивается
	CHS_CLOSING = 4,    // завершение
	CHS_NF_OPENED = 5,  // открыт нефискальный чек
	CHS_DISCOUNTED = 6, // сделана скидка
	CHS_NOTUSED = 7,
	CHS_CANCELING = 8,  // выполнены анулирования
	CHS_CANCELED = 9,   // режим анулирования
};

class CFiscalPrinter_DatecsKrypton : public CFiscalPrinter_DatecsBase
{
	long m_nLastReceiptNo;
	long m_nLastZReportNo;
	std::unordered_map <__int64, long> _mapCodes;
	wchar_t _payModeCash;
	wchar_t _payModeCard;
	std::unordered_map <long, wchar_t> _taxChars; // prc*100 -> char
public:
	CFiscalPrinter_DatecsKrypton();

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
	virtual long CloseReceipt() override;

	//virtual bool CloseCheck(int sum, int get, CFiscalPrinter::PAY_MODE pm, LPCWSTR szText = NULL);
	virtual DWORD GetFlags();

	virtual int GetLastReceiptNo(bool bFromPrinter = false) override;
	virtual LONG GetCurrentZReportNo(bool bFromPrinter = false) override;
	//virtual bool FillZReportInfo(ZREPORT_INFO& zri);
	//virtual bool GetCash(__int64 termId, COleCurrency& cy);
	virtual void SetCurrentTime() override;
	virtual void DisplayDateTime() override;
	virtual void DisplayClear() override;
	virtual void DisplayRow(int rowNo, LPCTSTR szString) override;

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
	virtual bool CancelReceipt(__int64 termId, bool& bClosed) override;
	virtual bool CancelReceiptCommand() override;
	virtual bool IsEndOfTape() override;

protected:

	enum ERRORS {
		err_NOT_CONNECTED = 0xFFFF0001,
		err_NOT_NOTSYNC = 0xFFFF0002,
	};

	virtual void CheckStatus() override;
	virtual void GetErrorCode() override;
	virtual std::wstring GetLastErrorS() override;

	bool CheckPaymentSum(int get);

	RECEIPT_STATUS GetReceiptStatus();

	void OpenFiscal(int opNo, LPCTSTR pwd, int tNo, std::wstring& info);
	void OpenFiscalReturn(int opNo, LPCTSTR pwd, int tNo, std::wstring& info);
	void Payment(WCHAR mode, int sum, std::wstring& info);
	long CloseFiscal();
	void AddPrinterArticle(int code, const wchar_t* name, const wchar_t*  unit, long vat);
	int GetPrintCodeByArticle(__int64 art, LPCWSTR szName);
	void CancelReceiptPrinter();
	bool GetPrinterCheckNoForCopy(long& chNo, bool bShowStateError = true);
	//bool GetDaySum(long src, long ix, CY& value1, CY& value2);
private:
	long GetPrinterLastReceiptNo();
	long GetPrinterLastZReportNo();
	void GetPrinterPayModes();
	void GetTaxRates();
	void TraceStatus();
};
