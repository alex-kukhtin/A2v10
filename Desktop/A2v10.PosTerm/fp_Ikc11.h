#pragma once

class CFiscalPrinter_Ikc11 : public CFiscalPrinter_IkcBase
{
public:
	CFiscalPrinter_Ikc11(const wchar_t* model);
protected:
	virtual void CreateCommand(const wchar_t* name, FP_COMMAND cmd, BYTE* pData = NULL, int DataLen = 0);
	virtual void SendCommand();
	virtual void RecalcCrcSum();

protected:
	virtual std::wstring FPGetLastError() override;
};


