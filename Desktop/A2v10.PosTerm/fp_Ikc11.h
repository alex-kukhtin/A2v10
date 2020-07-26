#pragma once

class CFiscalPrinter_Ikc11 : public CFiscalPrinter_IkcBase
{
public:
	CFiscalPrinter_Ikc11();
protected:
	virtual void CreateCommand(const wchar_t* name, FP_COMMAND cmd, BYTE* pData = NULL, int DataLen = 0);
	virtual void SendCommand();
	virtual void RecalcCrcSum();

protected:
	virtual int GetLastCheckNo(bool bFromPrinter = false);
	virtual JsonObject FillZReportInfo() override;

protected:
	void DayReport_(void* Info);
	void DayReport_Tag(void* Info, BYTE tag, size_t infoSize);
	virtual std::wstring FPGetLastError();
};


