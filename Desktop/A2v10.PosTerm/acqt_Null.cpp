// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "equipmentbase.h"
#include "acqterminalimpl.h"
#include "acqt_Null.h"
#include "stringtools.h"


// virtual 
void AcqTerminal_Null::Open(const wchar_t* port, const wchar_t* log)
{
	TraceINFO(L"TESTACQUIRING [%s]. Open({port:'%s', log:'%s'})", _id.c_str(), port, log);
}

// virtual 
bool AcqTerminal_Null::Payment(long amount)
{
	TraceINFO(L"TESTACQUIRING [%s]. Payment({amount:'%ld'})", _id.c_str(), amount);
	::Sleep(5000);
	return true;
}
