// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "framework.h"
#include "posterm.h"

const wchar_t*  MONITOR_WNDCLASS = L"A2V10_MONITOR_WNDCLASS";
const wchar_t*  MONITOR_WNDNAME = L"A2v10.Pos.Monitor";

class PosMonitor : public ITraceTarget {
	HWND hWnd;
	UINT nRegisterMessage;
public:
	PosMonitor()
		: hWnd(nullptr), nRegisterMessage(0) {
	}

	virtual void Trace(TraceType type, const wchar_t* message) override;

	bool Create();
};

static PosMonitor monitor;

bool PosMonitor::Create()
{
	hWnd = ::FindWindow(MONITOR_WNDCLASS, MONITOR_WNDNAME);
	return hWnd != nullptr;
}

// virtual 
void PosMonitor::Trace(TraceType type, const wchar_t* message)
{
	if (!hWnd || !::IsWindow(hWnd))
		hWnd = ::FindWindow(MONITOR_WNDCLASS, MONITOR_WNDNAME);
	if (!hWnd || !::IsWindow(hWnd))
		return; // may be closed
	COPYDATASTRUCT copyData;
	copyData.dwData = (int)type;
	copyData.lpData = (void*) message;
	copyData.cbData = (lstrlen(message) + 1) * 2; // bytes

	::SendMessageW(hWnd, WM_COPYDATA, 0, (LPARAM)&copyData);
}


void PosCreateMonitor()
{
	if (monitor.Create())
		PosSetTraceTarget(&monitor);
}

