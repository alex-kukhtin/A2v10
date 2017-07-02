#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_RT_DATA

class CDotNetException
{
	std::wstring m_msg;
public:
	CDotNetException(const wchar_t* szError);
	void ReportError();
};

class CDotNetRuntime {
public:
	static void Start();
	static void Stop();
	static void LoadLibrary();
	static void SetMainWnd(HWND hWnd);
};

#undef AFX_DATA
#define AFX_DATA
