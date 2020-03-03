#pragma once

class AcqTerminalImpl;

enum eterm_result_t {
	_undefined,
	_confirm,
	_decline,
	_break,
	_error
};

class AcqTerminal
{
	std::wstring _id;
	std::unique_ptr<AcqTerminalImpl> _impl;

	static std::vector<std::unique_ptr<AcqTerminal> > _terminals;

public:
	static AcqTerminal* FindTerminal(const wchar_t* id);
	static eterm_result_t Connect(const wchar_t* model, const wchar_t* port, int baud);
	static void ShutDown();

	bool Create(const wchar_t* model);
	bool Open(const wchar_t* port, int baud);
	void Disconnect();
	const wchar_t* GetLastError();


	eterm_result_t Payment(long amount);
	eterm_result_t Return(long amount);
};