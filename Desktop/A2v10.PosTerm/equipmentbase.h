#pragma once

class EQUIPException
{
	UINT m_nID;
	std::wstring _error;

public:
	EQUIPException(unsigned nID)
		: m_nID(nID) {};
	EQUIPException(const wchar_t* szError)
		: m_nID(0), _error(szError) {};
	const wchar_t* GetError() { return _error.c_str(); }
};


class EquipmentBaseImpl
{
	static ITraceTarget* _traceTarget;
public:

public:
	static void SetTraceTarget(ITraceTarget* target);
	void TraceINFO(const wchar_t* info, ...);
	void TraceERROR(const wchar_t* info, ...);
private:
	void Trace(ITraceTarget::TraceType type, const wchar_t* msg, va_list args);
};
