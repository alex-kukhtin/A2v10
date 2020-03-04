#pragma once

// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

#pragma once

class IAcqTerminalDriver 
{
public:
	virtual void Response(const wchar_t* name, const wchar_t*) = 0;
	virtual void Message(const wchar_t* name, const wchar_t*) = 0;
	virtual void Identifier(const wchar_t* name, const wchar_t*) = 0;
};

class AcqTerminal_PrintecImpl;

struct AcqPrintecImplDeleter {
	void operator()(AcqTerminal_PrintecImpl* pImpl);
};

class AcqTerminal_Printec : public AcqTerminalImpl, public IAcqTerminalDriver
{
	std::unique_ptr<AcqTerminal_PrintecImpl, AcqPrintecImplDeleter> _impl;

public:
	virtual void Open(const wchar_t* port, const wchar_t* log) override;
	virtual bool Payment(long amount) override;

public:
	virtual void Response(const wchar_t* name, const wchar_t*) override;
	virtual void Message(const wchar_t* name, const wchar_t*) override;
	virtual void Identifier(const wchar_t* name, const wchar_t*) override;
};
