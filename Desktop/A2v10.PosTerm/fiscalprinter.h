#pragma once

class FiscalPrinterImpl;
class PosPrintReceiptData;
class PosReceiptItemData;
class AcqTerminalImpl;

class FiscalPrinter
{
	std::wstring _id;
	std::unique_ptr<FiscalPrinterImpl> _impl;
	std::unique_ptr< AcqTerminalImpl> _etermImpl;
	static std::vector<std::unique_ptr<FiscalPrinter> > _printers;

public:
	static FiscalPrinter* FindPrinter(const wchar_t* id);
	static pos_result_t Connect(const wchar_t* model, const wchar_t* port, int baud);
	static void ShutDown();

	bool Create(const wchar_t* model);
	bool Open(const wchar_t* port, int baud);
	void Disconnect();
	const wchar_t* GetLastError();


	void OpenReceipt();
	void OpenReturnReceipt(long retNo);
	void PrintDiscountForBill(long discountPercent, long discountSum);
	void NullReceipt(bool bOpenCashDrawer);

	//void Close(long TotalSum, long GetSum, PAY_MODE payMode, LPCWSTR szText = NULL);
	//LONG GetLastCheckNo(DB_ID termId, bool bFromPrinter = false);
	//LONG GetCurrentZReportNo(DB_ID termId, bool bFromPrinter = false);
	//void AddArticle(long art, const wchar_t* szName, int vatPercent, long price);

	void PrintFiscalText(const wchar_t* szText);
	void PrintNonFiscalText(const wchar_t* szText);

	void OpenCashDrawer();
	void XReport();
	void ZReport();

	// customer display
	void DisplayDateTime();
	void DisplayClear();
	void DisplayRow(int rowNo, const wchar_t* szString);

	void PrintReceipt(const PosPrintReceiptData* pData);

private:
	void PrintItem(const PosReceiptItemData* pData);
	void AddArticle(const PosReceiptItemData* pData);
};