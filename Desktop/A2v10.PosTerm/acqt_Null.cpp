// Copyright © 2020-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "acqterminalimpl.h"
#include "acqt_Null.h"
#include "stringtools.h"


// virtual 
bool AcqTerminal_Null::Payment(long amount)
{
	return false;
}
