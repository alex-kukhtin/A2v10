// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#pragma once

class CFiscalPrinter_Null : public FiscalPrinterImpl
{
	long m_nLastReceipt;
	long m_nLastZReportNo;
public:
	CFiscalPrinter_Null()
		: m_nLastReceipt(0), m_nLastZReportNo(0) {}
	virtual void Init() override;
	virtual bool IsOpen() const override;
	virtual bool IsReady() const override;
	virtual bool Open(const wchar_t* Port, DWORD nBaudRate) override;
	virtual void SetParams(const PosConnectParams& prms) override;
	virtual void Close() override;

	virtual void AddArticle(const RECEIPT_ITEM& item) override;
	virtual void PrintReceiptItem(const RECEIPT_ITEM& item) override;
	virtual void OpenReceipt() override;
	virtual void OpenReturnReceipt() override;
	virtual void Payment(PAYMENT_MODE mode, long sum) override;
	virtual void PrintTotal() override;
	virtual long CloseReceipt(bool bDisplay) override;
	virtual long PeriodReport(const wchar_t* report, bool bShort, const wchar_t* from, const wchar_t* to) override { return 0; };
	virtual JsonObject  FillZReportInfo() override;

	//virtual bool CloseCheck(int sum, int get, CFiscalPrinter::PAY_MODE pm, const wchar_t* szText = NULL);
	virtual long NullReceipt(bool bOpenCashDrawer) override;
	virtual bool CopyReceipt() override;
	virtual long XReport() override;
	virtual ZREPORT_RESULT ZReport() override;
	virtual void OpenCashDrawer() override;
	virtual SERVICE_SUM_INFO ServiceInOut(bool bOut, __currency sum, bool bOpenCashDrawer) override;
	//virtual bool FillZReportInfo(ZREPORT_INFO& zri);
	virtual LONG GetCurrentZReportNo(bool bFromPrinter = false) override;
	virtual void PrintFiscalText(const wchar_t* szText) override;
	virtual void PrintNonFiscalText(const wchar_t* szText) override;
	virtual bool PrintDiscount(long Type, long Sum, const wchar_t* szDescr) override;
	virtual bool PrintDiscountForAllReceipt(long dscPercent, long dscSum) override;
	//virtual bool PeriodicalByDate(BOOL Short, COleDateTime From, COleDateTime To) override;
	virtual bool PeriodicalByNo(BOOL Short, LONG From, LONG To) override;
	//virtual bool GetCash(__int64 termId, COleCurrency& cy) override;
	virtual void CancelReceipt() override;
	virtual void DisplayDateTime() override;
	virtual void DisplayClear()  override;
	virtual void DisplayRow(int rowNo, const wchar_t* szString)  override;
	virtual void SetCurrentTime() override;

	virtual bool ReportByArticles() override;
	virtual bool ReportRems() override;
	virtual bool ReportModemState() override;
	virtual void TraceCommand(const wchar_t* command) override;
protected:
	long GetPrinterLastZReportNo();
	void ReportMessage(const wchar_t* msg);
};
