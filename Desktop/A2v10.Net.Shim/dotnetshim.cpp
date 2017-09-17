
#include "string"
#include "windows.h"
#include "vcclr.h"

#include "../include/dotnetshim.h"


static HWND m_hWnd = nullptr;

CDotNetException::CDotNetException(const wchar_t* szError)
{
	m_msg = szError;
}

static void ThrowIfError()
{
	if (A2v10RuntimeNet::Desktop::HasError)
	{
		pin_ptr<const wchar_t> ptr = PtrToStringChars(A2v10RuntimeNet::Desktop::LastErrorMessage);
		if (ptr == nullptr)
			throw CDotNetException(L"unknown exception");
		throw CDotNetException(ptr);
	}
}

void CDotNetException::ReportError()
{
	::MessageBox(m_hWnd, m_msg.c_str(), NULL, MB_OK | MB_ICONEXCLAMATION);
}

// static 
void CDotNetRuntime::Start()
{
	A2v10RuntimeNet::Desktop::Start();
	ThrowIfError();
}


// static 
void CDotNetRuntime::Stop()
{
	A2v10RuntimeNet::Desktop::Stop();
	ThrowIfError();
}

// static 
void CDotNetRuntime::LoadLibrary()
{
	A2v10RuntimeNet::Desktop::LoadRuntimeLibrary();
	ThrowIfError();
}

// static 
void CDotNetRuntime::LoadModuleContext()
{
	A2v10RuntimeNet::Desktop::LoadModuleContext();
	ThrowIfError();
}

// static 
void CDotNetRuntime::SetMainWnd(HWND hWnd)
{
	m_hWnd = hWnd;
}

// static
void CDotNetRuntime::OpenSolution(LPCWSTR szFileName)
{
	auto fileName = gcnew System::String(szFileName);
	A2v10RuntimeNet::Desktop::OpenSolution(fileName);
	ThrowIfError();
}

// satatic
std::wstring CDotNetRuntime::ProcessRequest(LPCWSTR szUrl, LPCWSTR szSearch, LPCWSTR szPostData)
{
	auto url = gcnew System::String(szUrl);
	auto search = gcnew System::String(szSearch);
	auto postData = gcnew System::String(szPostData);
	auto result = A2v10RuntimeNet::Desktop::ProcessRequest(url, search, postData);
	pin_ptr<const wchar_t> ptr = PtrToStringChars(result);
	return ptr;
}

// static 
void CDotNetRuntime::StartDesktopServices() 
{
	A2v10RuntimeNet::Desktop::StartDesktopServices();
	ThrowIfError();
}
