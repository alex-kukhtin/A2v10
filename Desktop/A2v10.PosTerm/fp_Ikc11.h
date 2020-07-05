#pragma once

class CFiscalPrinter_Ikc11 : public CFiscalPrinter_IkcBase
{
public:
	CFiscalPrinter_Ikc11();
protected:
	virtual void CreateCommand(FP_COMMAND cmd, BYTE* pData = NULL, int DataLen = 0);
	virtual void SendCommand();
	virtual void RecalcCrcSum();

protected:
	virtual int GetLastCheckNo(bool bFromPrinter = false);
	virtual JsonObject FillZReportInfo() override;

protected:
	void DayReport_(void* Info);
	virtual std::wstring FPGetLastError();
};


