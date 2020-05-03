#pragma once

class FiscalPrinterImpl;
class PosPrintReceiptData;
class PosReceiptItemData;

struct SERVICE_SUM_INFO {
	__currency sumOnHand;
	int no;
	int flags;

	SERVICE_SUM_INFO()
		: no(0), flags(0) {

	}
};

class FiscalPrinter
{
	std::wstring _id;
	std::unique_ptr<FiscalPrinterImpl> _impl;
	static std::vector<std::unique_ptr<FiscalPrinter> > _printers;

public:
	static FiscalPrinter* FindPrinter(const wchar_t* id);

	static void Connect(const PosConnectParams& prms);

	static void ShutDown();

	bool Create(const wchar_t* model);
	bool Open(const wchar_t* port, int baud);
	void SetParams(const PosConnectParams& prms);
	void Disconnect();
	const wchar_t* GetLastError();


	void OpenReceipt();
	void OpenReturnReceipt(long retNo);
	void PrintDiscountForBill(long discountPercent, long discountSum);
	void NullReceipt(bool bOpenCashDrawer);
	SERVICE_SUM_INFO ServiceInOut(bool bOut, __currency amount, bool bOpenCashDrawer);

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