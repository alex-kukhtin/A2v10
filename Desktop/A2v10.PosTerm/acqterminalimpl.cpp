// Copyright � 2019-2020 Alex Kukhtin. All rights reserved

#include "pch.h"
#include "posterm.h"
#include "equipmentbase.h"
#include "acqterminalimpl.h"


// virtual 
void AcqTerminalImpl::Close()
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

// virtual 
std::wstring AcqTerminalImpl::Response()
{
	return _response.ToString();
}

