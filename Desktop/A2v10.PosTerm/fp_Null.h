// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#pragma once

class CFiscalPrinter_Null : public CFiscalPrinterImpl
{
	int m_nLastCheck;
	long m_nLastZReportNo;
public:
	CFiscalPrinter_Null()
		: m_nLastCheck(0), m_nLastZReportNo(0) {}
	virtual bool Init(__int64 termId) override;
	virtual bool IsOpen() const override
	{
		return true;
	}
	virtual bool IsReady() const override
	{
		return true;
	}
	virtual bool Open(const wchar_t* Port, DWORD nBaudRate) override;
	virtual int GetLastCheckNo(__int64 termId, bool bFromPrinter = false)
	{
		return m_nLastCheck++;
	}
	virtual bool AddArticle(__int64 termId, __int64 art, const wchar_t* szName, __int64 vtid, long price)
	{
		return true;
	}
	//virtual bool PrintCheckItem(const CFPCheckItemInfo& info);
	virtual bool OpenCheck(const wchar_t* szDepartmentName, __int64 termId) override
	{
		return true;
	}
	virtual void Close() override;

	//virtual bool CloseCheck(int sum, int get, CFiscalPrinter::PAY_MODE pm, const wchar_t* szText = NULL);
	virtual bool NullCheck(bool bOpenCashDrawer) override;
	virtual bool CopyCheck() override;
	virtual bool XReport() override;
	virtual bool ZReport() override;
	virtual bool OpenCashDrawer() override;
	virtual bool ServiceInOut(__int64 sum, __int64 hid) override;
	//virtual bool FillZReportInfo(ZREPORT_INFO& zri);
	virtual LONG GetCurrentZReportNo(__int64 termId, bool bFromPrinter = false) override;
	virtual bool PrintFiscalText(const wchar_t* szText) override;
	//virtual bool PeriodicalByDate(BOOL Short, COleDateTime From, COleDateTime To) override;
	virtual bool PeriodicalByNo(BOOL Short, LONG From, LONG To) override;
	//virtual bool GetCash(__int64 termId, COleCurrency& cy) override;
	virtual bool CancelCheckCommand(__int64 termId) override;

protected:
	bool GetPrinterLastZReportNo(__int64 termId, long& zNo);
	void ReportMessage(const wchar_t* msg);
};
