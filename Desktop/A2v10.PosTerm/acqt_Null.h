// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

#pragma once


class AcqTerminal_Null : public AcqTerminalImpl
{
public:
	virtual void Open(const wchar_t* port, const wchar_t* log) override;
	virtual bool Payment(long amount) override;
};