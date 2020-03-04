#pragma once

class AcqTerminalImpl : public EquipmentBaseImpl
{
public:
	std::wstring _id;
	JsonObject _response;

	virtual void Open(const wchar_t* port, const wchar_t* log);
	virtual void Close();
	virtual void Init();
	virtual bool IsOpen();

	virtual bool Payment(long amount) = 0;
	virtual std::wstring Response();
};