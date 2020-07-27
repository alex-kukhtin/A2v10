#pragma once

class FiscalPrinterImpl;
class PosPrintReceiptData;
class PosReceiptItemData;

struct SERVICE_SUM_INFO {
	__currency sumOnHand;
	int no;
	int flags;

	SERVICE_SUM_INFO()
		: no(0), flags(0) {}
};

struct ZREPORT_RESULT {
	int no;
	int zno;
	ZREPORT_RESULT()
		: no(0), zno(0) {}
};

enum TEXT_ALIGN {
	_left,
	_center,
	_right
};

class FiscalPrinter
{
	std::wstring _id;
	std::unique_ptr<FiscalPrinterImpl> _impl;
	static std::vector<std::unique_ptr<FiscalPrinter> > _printers;

public:
	static FiscalPrinter* FindPrinter(const wchar_t* id);

	static FiscalPrinter* Connect(const PosConnectParams& prms);

	static void ShutDown();

	bool Create(const wchar_t* model);
	bool Open(const wchar_t* port, int baud);
	void SetParams(const PosConnectParams& prms);
	void Disconnect();
	const wchar_t* GetLastError();
	void ReadErrorCode();


	void OpenReceipt();
	void OpenReturnReceipt();
	long NullReceipt(bool bOpenCashDrawer);
	SERVICE_SUM_INFO ServiceInOut(bool bOut, __currency amount, bool bOpenCashDrawer);
	long PeriodReport(const wchar_t* report, bool bShort, const wchar_t* from, const wchar_t* to);
	JsonObject  FillZReportInfo();
	void AddMessages(JsonObject& json);
	void GetInfo(JsonObject& json);
	long CopyReceipt();

	//void Close(long TotalSum, long GetSum, PAY_MODE payMode, LPCWSTR szText = NULL);
	//LONG GetLastCheckNo(DB_ID termId, bool bFromPrinter = false);
	//LONG GetCurrentZReportNo(DB_ID termId, bool bFromPrinter = false);
	//void AddArticle(long art, const wchar_t* szName, int vatPercent, long price);

	void PrintFiscalText(const wchar_t* szText);
	void PrintNonFiscalText(const wchar_t* szText);

	void OpenCashDrawer();
	long XReport();
	ZREPORT_RESULT ZReport();

	// customer display
	void DisplayDateTime();
	void DisplayClear();
	void DisplayRow(int rowNo, const wchar_t* szString, TEXT_ALIGN align);

	long PrintReceipt(const PosPrintReceiptData* pData);
	long PrintReturnReceipt(const PosPrintReceiptData* pData);
	long TestReceipt(const PosPrintReceiptData* pData);

private:
	void PrintItem(const PosReceiptItemData* pData);
	void AddArticle(const PosReceiptItemData* pData);
};