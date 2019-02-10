#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_RT_DATA

class CDotNetException
{
	std::wstring m_msg;
public:
	CDotNetException(const wchar_t* szError);
	void ReportError();
	LPCWSTR GetMessage() {
		return m_msg.c_str();
	}
};

class CDotNetRuntime {
public:
	static void Start();
	static void Stop();
	static void LoadLibrary();
	static void LoadModuleContext();
	static void SetMainWnd(HWND hWnd);
	static void OpenSolution(LPCWSTR szFileName);

	static void StartDesktopServices();
	static std::wstring ProcessRequest(LPCWSTR szUrl, LPCWSTR szSearch, LPCWSTR szPost);
	static std::wstring GetLastMime();
};

#undef AFX_DATA
#define AFX_DATA
