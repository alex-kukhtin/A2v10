// Copyright © 2019-2020 Alex Kukhtin. All rights reserved

#include "pch.h"
#include "posterm.h"
#include "equipmentbase.h"

#define MAX_MSG_LEN 1024

// static 
ITraceTarget* EquipmentBaseImpl::_traceTarget = nullptr;

// static 
void EquipmentBaseImpl::SetTraceTarget(ITraceTarget* target)
{
	_traceTarget = target;
}

void EquipmentBaseImpl::TraceINFO(const wchar_t* info, ...)
{
	va_list argList;
	va_start(argList, info);
	Trace(ITraceTarget::_info, info, argList);
	va_end(argList);
}

void EquipmentBaseImpl::TraceERROR(const wchar_t* info, ...)
{
	va_list argList;
	va_start(argList, info);
	Trace(ITraceTarget::_info, info, argList);
	va_end(argList);
}

// static 
void EquipmentBaseImpl::Trace(ITraceTarget::TraceType type, const wchar_t* info, va_list args)
{
	if (!_traceTarget)
		return;
	wchar_t buff[MAX_MSG_LEN];
	vswprintf(buff, MAX_MSG_LEN - 1, info, args);
	_traceTarget->Trace(type, buff);
}
