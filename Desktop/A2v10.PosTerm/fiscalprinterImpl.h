// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#pragma once

class CFPCheckItemInfo;
class CFiscalPrinterInfo;

class CFPException
{
	UINT m_nID;
	std::wstring m_strError;
public:
	CFPException(unsigned nID)
		: m_nID(nID) {};
	CFPException(const wchar_t* szError)
		: m_nID(0), m_strError(szError) {};
	void ReportError2();
	std::wstring GetError();
};

class CFiscalPrinterImpl
{
public:
	std::wstring m_strKey;
	std::wstring m_strError;
	bool m_bBigMsg;

	enum PrinterFlags
	{
		FP_SYNCTIME = 0x0001,
		FP_MODEMSTATE = 0x0002
	};


	CFiscalPrinterImpl(void);
	virtual ~CFiscalPrinterImpl();

	virtual bool IsOpen() const;
	virtual bool IsReady() const;
	virtual bool Open(const wchar_t* Port, DWORD nBaudRate) = 0;
	virtual bool Init(__int64 termId);
	virtual void Close() = 0;
	virtual DWORD GetFlags();

	virtual int GetLastCheckNo(__int64 termId, bool bFromPrinter = false);
	virtual LONG GetCurrentZReportNo(__int64 termId, bool bFromPrinter = false);
	//virtual bool FillZReportInfo(ZREPORT_INFO& zri);

	virtual void SetPrinterInfo(const CFiscalPrinterInfo& info);
	virtual bool PrintDiagnostic();
	virtual bool XReport()  = 0;
	virtual bool ZReport() = 0;
	virtual bool NullCheck(bool bOpenCashDrawer) = 0;
	virtual bool PostNullCheck(__int64 hid);
	virtual bool PostClose(__int64 hid);
	virtual bool ProgramOperator(const wchar_t* Name, const wchar_t* Password);
	virtual bool CancelCheck(__int64 termId, bool& bClosed) = 0;
	virtual bool CancelCheckCommand(__int64 termId) = 0;
	virtual bool OpenCheck(const wchar_t* szDepartmentName, __int64 termId) = 0;
	virtual bool OpenReturnCheck(const wchar_t* szDepartmentName, __int64 termId, long checkNo) = 0;
	virtual bool PrintCheckItem(const CFPCheckItemInfo& info) = 0;
	virtual bool PrintDiscount(LONG Type, LONG Sum, const wchar_t* szDescr) = 0;
	virtual bool PrintDiscountForCheck(long dscPercent, long dscSum) = 0;
	//virtual bool CloseCheck(int sum, int get, CFiscalPrinter::PAY_MODE pm, const wchar_t* szText = nullptr);
	//virtual bool CloseCheck2(int sum, int ret, int get, CFiscalPrinter::PAY_MODE pm);
	virtual bool ServiceInOut(__int64 sum, __int64 hid) = 0;
	//virtual bool PeriodicalByDate(BOOL Short, COleDateTime From, COleDateTime To);
	virtual bool PeriodicalByNo(BOOL Short, LONG From, LONG To) = 0;
	virtual bool CopyCheck() = 0;
	virtual bool ReportByArticles() = 0;
	virtual bool ReportRems() = 0;
	virtual bool ReportModemState() = 0;
	virtual bool AddArticle(__int64 termId, __int64 art, const wchar_t* szName, __int64 vtid, long price) = 0;
	virtual bool OpenCashDrawer() = 0;
	virtual bool PrintFiscalText(const wchar_t* szText) = 0;
	virtual bool PrintNonFiscalText(const wchar_t* szText) = 0;
	virtual bool Beep();
	//virtual bool GetCash(__int64 termId, COleCurrency& cy);
	virtual void SetCurrentTime() = 0;
	virtual void DisplayDateTime() = 0;
	virtual void DisplayClear() = 0;
	virtual void DisplayRow(int rowNo, const wchar_t* szString) = 0;
	virtual bool IsEndOfTape();
	virtual const std::wstring& GetError() const;

	void TraceINFO(const wchar_t* info, ...);
	void TraceERROR(const wchar_t* info, ...);
	bool IsDebugMode() const;
};
