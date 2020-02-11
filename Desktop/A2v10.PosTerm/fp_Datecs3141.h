// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

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

class CFiscalPrinter_Datecs3141 : public CFiscalPrinter_DatecsBase
{
	long m_nLastReceiptNo;
	long m_nLastZReportNo;
	//CMap<DB_ID, DB_ID, int, int> m_mapCodes;
	WCHAR m_payModeCash;
	WCHAR m_payModeCard;
	WCHAR m_payModeCredit;
	WCHAR m_vatTaxGroup20;
	WCHAR m_vatTaxGroup7;
	WCHAR m_novatTaxGroup;
public:
	CFiscalPrinter_Datecs3141();

	virtual void PrintDiagnostic();
	virtual bool ProgramOperator(LPCWSTR Name, LPCWSTR Password);
	virtual void NullReceipt(bool bOpenCashDrawer) override;
	virtual void XReport() override;
	virtual void ZReport() override;
	virtual bool ServiceInOut(__int64 sum, __int64 hid) override;
	virtual void OpenReceipt() override;
	virtual void OpenReturnReceipt() override;
	virtual void Payment(PAYMENT_MODE mode, long sum) override;
	virtual void CloseReceipt() override;

	//virtual bool CloseCheck(int sum, int get, CFiscalPrinter::PAY_MODE pm, LPCWSTR szText = NULL);
	virtual DWORD GetFlags();

	virtual int GetLastReceiptNo(__int64 termId, bool bFromPrinter = false) override;
	virtual LONG GetCurrentZReportNo(__int64 termId, bool bFromPrinter = false) override;
	//virtual bool FillZReportInfo(ZREPORT_INFO& zri);
	//virtual bool GetCash(__int64 termId, COleCurrency& cy);
	virtual void SetCurrentTime() override;
	virtual void DisplayDateTime() override;
	virtual void DisplayClear() override;
	virtual void DisplayRow(int rowNo, LPCTSTR szString) override;

	virtual void PrintReceiptItem(const RECEIPT_ITEM& item) override;
	virtual void AddArticle(__int64 article, const wchar_t* szName, __int64 tax, long price) override;
	virtual bool CopyBill() override;
	virtual void Init() override;
	virtual void OpenCashDrawer() override;
	virtual void PrintFiscalText(const wchar_t* szText) override;
	virtual void Beep() override;
	//virtual bool PeriodicalByDate(BOOL Short, COleDateTime From, COleDateTime To) override;
	virtual bool PeriodicalByNo(BOOL Short, LONG From, LONG To) override;
	virtual bool ReportByArticles() override;
	virtual bool ReportModemState() override;
	virtual bool CancelReceipt(__int64 termId, bool& bClosed) override;
	virtual bool CancelReceiptCommand(__int64 termId) override;
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
	void CloseFiscal(long& chNo);
	void PrintTotal();
	void PrintItem(int code, int qty, double fQty, int price, int dscPrc, int dscSum, bool bIsWeight);
	void AddPrinterArticle(int code, LPCWSTR szName, bool bVat);
	int GetPrintCodeByArticle(__int64 art, LPCWSTR szName);
	void CancelReceiptPrinter();
	bool GetPrinterLastReceiptNo(long& chNo, bool bShowStateError = true);
	bool GetPrinterCheckNoForCopy(long& chNo, bool bShowStateError = true);
	//bool GetDaySum(long src, long ix, CY& value1, CY& value2);
private:
	long GetPrinterLastZReportNo();
	void GetPrinterPayModes();
	void GetTaxRates();
};
