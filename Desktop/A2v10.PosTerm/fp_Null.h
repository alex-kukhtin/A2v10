// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#pragma once

class CFiscalPrinter_Null : public FiscalPrinterImpl
{
	int m_nLastReceipt;
	long m_nLastZReportNo;
public:
	CFiscalPrinter_Null()
		: m_nLastReceipt(0), m_nLastZReportNo(0) {}
	virtual bool Init(__int64 termId) override;
	virtual bool IsOpen() const override;
	virtual bool IsReady() const override;
	virtual bool Open(const wchar_t* Port, DWORD nBaudRate) override;
	virtual void Close() override;
	virtual int GetLastReceiptNo(__int64 termId, bool bFromPrinter = false) override;

	virtual void AddArticle(__int64 article, const wchar_t* szName, __int64 vtid, __int64 price) override;
	virtual void PrintReceiptItem(const RECEIPT_ITEM& item) override;
	virtual void OpenReceipt() override;
	virtual void OpenReturnReceipt() override;

	//virtual bool CloseCheck(int sum, int get, CFiscalPrinter::PAY_MODE pm, const wchar_t* szText = NULL);
	virtual void NullReceipt(bool bOpenCashDrawer) override;
	virtual bool CopyBill() override;
	virtual void XReport() override;
	virtual void ZReport() override;
	virtual void OpenCashDrawer() override;
	virtual bool ServiceInOut(__int64 sum, __int64 hid) override;
	//virtual bool FillZReportInfo(ZREPORT_INFO& zri);
	virtual LONG GetCurrentZReportNo(__int64 termId, bool bFromPrinter = false) override;
	virtual void PrintFiscalText(const wchar_t* szText) override;
	virtual void PrintNonFiscalText(const wchar_t* szText) override;
	virtual bool PrintDiscount(long Type, long Sum, const wchar_t* szDescr) override;
	virtual bool PrintDiscountForAllReceipt(long dscPercent, long dscSum) override;
	//virtual bool PeriodicalByDate(BOOL Short, COleDateTime From, COleDateTime To) override;
	virtual bool PeriodicalByNo(BOOL Short, LONG From, LONG To) override;
	//virtual bool GetCash(__int64 termId, COleCurrency& cy) override;
	virtual bool CancelReceipt(__int64 termId, bool& bClosed) override;
	virtual bool CancelReceiptCommand(__int64 termId) override;
	virtual void DisplayDateTime() override;
	virtual void DisplayClear()  override;
	virtual void DisplayRow(int rowNo, const wchar_t* szString)  override;
	virtual void SetCurrentTime() override;

	virtual bool ReportByArticles() override;
	virtual bool ReportRems() override;
	virtual bool ReportModemState() override;
protected:
	bool GetPrinterLastZReportNo(__int64 termId, long& zNo);
	void ReportMessage(const wchar_t* msg);
};
