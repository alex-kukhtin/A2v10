#pragma once

class CFiscalPrinterImpl;

class FiscalPrinter
{
	std::wstring _id;
	std::unique_ptr<CFiscalPrinterImpl> _impl;
	static std::vector<std::unique_ptr<FiscalPrinter> > _printers;

public:
	static FiscalPrinter* FindPrinter(const wchar_t* id);
	static pos_result_t Connect(const wchar_t* model, const wchar_t* port, int baud);

	bool Create(const wchar_t* model);
	bool Open(const wchar_t* port, int baud);
	const wchar_t* GetLastError();

	void NullReceipt(bool bOpenCashDrawer);

	void OpenReturnReceipt(long retNo);
	void PrintDiscountForBill(long discountPercent, long discountSum);
	//void Close(long TotalSum, long GetSum, PAY_MODE payMode, LPCWSTR szText = NULL);
	//LONG GetLastCheckNo(DB_ID termId, bool bFromPrinter = false);
	//LONG GetCurrentZReportNo(DB_ID termId, bool bFromPrinter = false);
	//void AddArticle(DB_ID termId, DB_ID art, LPCWSTR szName, DB_ID vtid, long price);
	void PrintFiscalText(const wchar_t* szText);
	void PrintNonFiscalText(const wchar_t* szText);
	void OpenCashDrawer();
	void XReport();
	void ZReport();

	// customer display
	void DisplayDateTime();
	void DisplayClear();
	void DisplayRow(int rowNo, const wchar_t* szString);
};