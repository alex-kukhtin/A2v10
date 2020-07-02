#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_OMEXT_DATA

class CFiscalPrinter_Ikc11 : public CFiscalPrinter_IkcBase
{
public:
	CFiscalPrinter_Ikc11();
protected:
	virtual bool Init(DB_ID termId);
protected:
	virtual void CreateCommand(FP_COMMAND cmd, BYTE* pData = NULL, int DataLen = 0);
	virtual void SendCommand();
	virtual void RecalcCrcSum();

protected:
	virtual int GetLastCheckNo(DB_ID termId, bool bFromPrinter = false);
	virtual bool FillZReportInfo(ZREPORT_INFO& zri);

protected:
	void DayReport_(void* Info);
	virtual CString FPGetLastError();
};

#undef AFX_DATA
#define AFX_DATA

