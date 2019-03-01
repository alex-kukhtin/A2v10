
#include "string"
#include "vector"
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
void CDotNetRuntime::ProcessRequest(const wchar_t* szUrl, const wchar_t* szSearch, std::vector<byte>& post, std::vector<byte>& data, bool postMethod)
{
	auto url = gcnew System::String(szUrl);
	auto search = gcnew System::String(szSearch);
	auto postData = gcnew array<System::Byte>(post.size());
	if (post.size() > 0)
		System::Runtime::InteropServices::Marshal::Copy((System::IntPtr) post.data(), postData, 0, post.size());
	auto result = A2v10RuntimeNet::Desktop::ProcessRequest(url, search, postData, postMethod);
	if (result) {
		int len = result->Length;
		data.resize(len);
		if (len > 0)
			System::Runtime::InteropServices::Marshal::Copy(result, 0, (System::IntPtr) data.data(), len);
	}
}

// static 
void CDotNetRuntime::UploadFiles(const wchar_t* szUrl, const wchar_t* szFiles, std::vector<byte>& data)
{
	auto url = gcnew System::String(szUrl);
	auto files = gcnew System::String(szFiles);
	auto result = A2v10RuntimeNet::Desktop::UploadFiles(url, files);
	if (result) {
		int len = result->Length;
		data.resize(len);
		if (len > 0)
			System::Runtime::InteropServices::Marshal::Copy(result, 0, (System::IntPtr) data.data(), len);
	}
}

//static 
std::wstring CDotNetRuntime::GetLastMime()
{
	auto result = A2v10RuntimeNet::Desktop::GetLastMime();
	pin_ptr<const wchar_t> ptr = PtrToStringChars(result);
	return ptr;
}

std::wstring CDotNetRuntime::GetLastContentDisposition()
{
	auto result = A2v10RuntimeNet::Desktop::GetLastContentDisposition();
	pin_ptr<const wchar_t> ptr = PtrToStringChars(result);
	return ptr;
}


// static 
void CDotNetRuntime::StartDesktopServices() 
{
	A2v10RuntimeNet::Desktop::StartDesktopServices();
	ThrowIfError();
}
