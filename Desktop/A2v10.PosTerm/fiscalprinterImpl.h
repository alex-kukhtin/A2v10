// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#pragma once


struct PosConnectParams;

struct RECEIPT_ITEM {
	__int64 article;
	const wchar_t* name;
	const wchar_t* unit;
	__currency vat;
	__currency excise;
	int qty;
	__currency weight;
	__currency price;
	__currency sum;
	__currency discount;
	RECEIPT_ITEM()
		: article(0), qty(0), name(nullptr), unit(nullptr) {}
};

struct PAYMENT_INFO {
	__currency sumCash;
	__currency sumGet;
	__currency sumCard;

	PAYMENT_INFO() {}
};

enum PAYMENT_MODE {
	_pay_cash,
	_pay_card
};

class FiscalPrinterImpl : public EquipmentBaseImpl
{
public:
	std::wstring _id;
	std::wstring m_strError;

	enum PrinterFlags
	{
		FP_SYNCTIME = 0x0001,
		FP_MODEMSTATE = 0x0002
	};

	FiscalPrinterImpl(void);
	virtual ~FiscalPrinterImpl();

	const wchar_t* GetLastError();

	virtual bool IsOpen() const;
	virtual bool IsReady() const;
	virtual bool Open(const wchar_t* Port, DWORD nBaudRate) = 0;
	virtual void Init();
	virtual void SetParams(const PosConnectParams& prms) = 0;
	virtual void Close();
	virtual DWORD GetFlags();
	virtual void GetStatusMessages(std::vector<std::wstring>& msgs) = 0;
	virtual void GetPrinterInfo(JsonObject& json) = 0;
	virtual void GetErrorCode() = 0;

	//virtual int GetLastReceiptNo(bool bFromPrinter = false) = 0;
	//virtual LONG GetCurrentZReportNo(bool bFromPrinter = false) = 0;
	//virtual bool FillZReportInfo(ZREPORT_INFO& zri);

	//virtual void SetPrinterInfo(const CFiscalPrinterInfo& info);
	//virtual bool PrintDiagnostic();
	virtual long XReport()  = 0;
	virtual ZREPORT_RESULT ZReport() = 0;
	virtual long NullReceipt(bool bOpenCashDrawer) = 0;
	//virtual bool PostNullCheck(__int64 hid);
	//virtual bool PostClose(__int64 hid);
	//virtual bool ProgramOperator(const wchar_t* Name, const wchar_t* Password);
	virtual void CancelReceipt() = 0;
	virtual void OpenReceipt() = 0;
	virtual void OpenReturnReceipt() = 0;
	virtual void PrintReceiptItem(const RECEIPT_ITEM& item) = 0;
	virtual void PrintTotal() = 0;
	virtual void Payment(PAYMENT_MODE mode, long sum) = 0;
	virtual long CloseReceipt(bool bDisplay) = 0;
	virtual long PeriodReport(const wchar_t* report, bool bShort, const wchar_t* from, const wchar_t* to) = 0;
	virtual JsonObject FillZReportInfo() = 0;
	virtual long CopyReceipt() = 0;
	//virtual bool PrintCheckItem(const CFPCheckItemInfo& info) = 0;
	virtual bool PrintDiscount(long Type, long Sum, const wchar_t* szDescr);
	virtual bool PrintDiscountForAllReceipt(long dscPercent, long dscSum);
	//virtual bool CloseCheck(int sum, int get, CFiscalPrinter::PAY_MODE pm, const wchar_t* szText = nullptr);
	//virtual bool CloseCheck2(int sum, int ret, int get, CFiscalPrinter::PAY_MODE pm);
	virtual SERVICE_SUM_INFO ServiceInOut(bool bOut, __currency sum, bool bOpenCashDrawer) = 0;
	//virtual bool PeriodicalByDate(BOOL Short, COleDateTime From, COleDateTime To);
	virtual bool PeriodicalByNo(BOOL Short, LONG From, LONG To) = 0;
	virtual bool ReportByArticles() = 0;
	virtual bool ReportRems();
	virtual bool ReportModemState() = 0;
	virtual void AddArticle(const RECEIPT_ITEM& item) = 0;
	virtual void OpenCashDrawer() = 0;
	virtual void PrintFiscalText(const wchar_t* szText) = 0;
	virtual void PrintNonFiscalText(const wchar_t* szText);
	virtual void Beep();
	//virtual bool GetCash(__int64 termId, COleCurrency& cy);
	virtual void SetCurrentTime() = 0;
	virtual void DisplayDateTime() = 0;
	virtual void DisplayClear() = 0;
	virtual void DisplayRow(int rowNo, const wchar_t* szString) = 0;
	virtual bool IsEndOfTape();
	virtual void TraceCommand(const wchar_t* command) = 0;
	virtual const std::wstring& GetError() const;

	bool IsDebugMode() const;
};
