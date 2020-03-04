#pragma once

class AcqTerminalImpl
{
	static ITraceTarget* _traceTarget;
public:
	virtual void Close();
	virtual bool Payment(long amount) = 0;
public:
	static void PosSetTraceTarget(ITraceTarget* target);
	void TraceINFO(const wchar_t* info, ...);
};