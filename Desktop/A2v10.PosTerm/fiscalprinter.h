#pragma once

class CFiscalPrinterImpl;

class FiscalPrinter
{
	std::wstring _id;
	std::unique_ptr<CFiscalPrinterImpl> _impl;
	static std::vector<std::unique_ptr<FiscalPrinter> > _printers;

public:
	static FiscalPrinter* FindPrinter(const wchar_t* id);
	void Create(const wchar_t* model);

	void Open();
	void OpenReturn(long retNo);
	void PrintDiscountForBill(long discountPercent, long discountSum);
	//void Close(long TotalSum, long GetSum, PAY_MODE payMode, LPCWSTR szText = NULL);
	//LONG GetLastCheckNo(DB_ID termId, bool bFromPrinter = false);
	//LONG GetCurrentZReportNo(DB_ID termId, bool bFromPrinter = false);
	//void AddArticle(DB_ID termId, DB_ID art, LPCWSTR szName, DB_ID vtid, long price);
	void PrintFiscalText(const wchar_t* szText);
	void PrintNonFiscalText(const wchar_t* szText);
	void OpenCashDrawer();

	// customer display
	void DisplayDateTime();
	void DisplayClear();
	void DisplayRow(int rowNo, const wchar_t* szString);
};