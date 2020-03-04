// Copyright © 2019-2020 Alex Kukhtin. All rights reserved

#include "pch.h"
#include "posterm.h"
#include "equipmentbase.h"
#include "acqterminalimpl.h"


// virtual 
void AcqTerminalImpl::Close()
{

}

// virtual 
void AcqTerminalImpl::Open(const wchar_t* port, const wchar_t* log)
{
}

// virtual 
void AcqTerminalImpl::Init()
{

}

// virtual 
bool AcqTerminalImpl::IsOpen()
{
	return true;
}
