
#include "string"
#include "windows.h"
#include "vcclr.h"

#include "../include/dotnetshim.h"


static HWND m_hWnd = nullptr;

CDotNetException::CDotNetException(const wchar_t* szError)
{
	m_msg = szError;
}

void CDotNetException::ReportError()
{
	::MessageBox(m_hWnd, m_msg.c_str(), NULL, MB_OK | MB_ICONEXCLAMATION);
}

// static 
void CDotNetRuntime::Start()
{
	A2v10RuntimeNet::Desktop::Start();
	//::MessageBox(NULL, L"started from (DLL) !", NULL, MB_OK | MB_ICONEXCLAMATION);
	//ThrowIfError();
}

// static 
void CDotNetRuntime::Stop()
{
	A2v10RuntimeNet::Desktop::Stop();
}

// static 
void CDotNetRuntime::SetMainWnd(HWND hWnd)
{
	m_hWnd = hWnd;
}

