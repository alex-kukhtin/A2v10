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
	static void StartApplication(const wchar_t* szConnectionString);
	static void StartDesktopServices();
	static void ProcessRequest(const wchar_t* szUrl, const wchar_t* szSearch, std::vector<byte>& post, std::vector<byte>& data, bool postMethod);
	static void UploadFiles(const wchar_t* szUrl, const wchar_t* szfiles, std::vector<byte>& data);
	static std::wstring GetLastMime();
	static std::wstring GetLastContentDisposition();
	static int GetLastStatusCode();
};

#undef AFX_DATA
#define AFX_DATA
