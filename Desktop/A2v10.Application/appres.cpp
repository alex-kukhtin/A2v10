// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.


#include "stdafx.h"

#include "appres.h"
#include "resource.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


const wchar_t* MimeTypes[] = 
{
	/*0*/ L"text/html",
	/*1*/ L"text/css",
	/*2*/ L"text/javascript",
	/*3*/ L"application/json",
	/*4*/ L"application/font-woff",
	/*5*/ L"application/font-ttf",
	/*6*/ L"image/png",
};

enum MimeIndex {
	html = 0,
	css = 1,
	js = 2,
	json = 3,
	woff = 4,
	ttf = 5
};

struct RES_DEF
{
	LPCWSTR szName;
	UINT nRes;
	MimeIndex eMime;
};


const RES_DEF resArray[] =
{
	{L"css/site.min.css",			IDWEB_SITE_MAIN_CSS,		MimeIndex::css   },
	{L"scripts/locale-uk.min.js",	IDWEB_SCRIPT_LOCALE_UK_JS,	MimeIndex::js    },
	{L"scripts/vue.js",				IDWEB_SCRIPT_VUE_JS,		MimeIndex::js    },
	{L"scripts/main.js",			IDWEB_SCRIPT_MAIN_JS,		MimeIndex::js    },
	{L"scripts/d3.min.js",			IDWEB_SCRIPT_D3_JS,			MimeIndex::js    },
	{L"css/fonts/a2v10.woff",		IDWEB_FONT_A2V10_FONT,		MimeIndex::woff  },
	{L"css/fonts/a2v10.ttf",		IDWEB_FONT_A2V10_FONT2,		MimeIndex::ttf   }

};

static LPCWSTR _findResourceId(LPCWSTR szUrl, std::wstring& mime)
{
	for (int i = 0; i < _countof(resArray); i++) {
		RES_DEF rd = resArray[i];
		if (_wcsicmp(szUrl, rd.szName) == 0) {
			mime = MimeTypes[rd.eMime];
			return MAKEINTRESOURCE(rd.nRes);
		}
	}
	return nullptr;
}


class CParsedUrl
{
public:
	CString protocol;
	CString domain;
	CString host;
	CString path;
	CString search;
	bool error;

	CParsedUrl() 
	: error(false) 
	{
	}

	static CParsedUrl CreateFrom(LPCSTR szUrl);

};


// static 
CParsedUrl CParsedUrl::CreateFrom(LPCSTR szUrl)
{
	CParsedUrl rv;
	rv.error = false;
	CString strUrl(szUrl);
	int pPos = strUrl.Find(L"://");
	rv.protocol = strUrl.Left(pPos);
	int dPos = strUrl.Find(L"/", pPos + 4);
	rv.domain = strUrl.Mid(pPos + 3, dPos - pPos - 3);
	strUrl = strUrl.Mid(dPos + 1);
	int sPos = strUrl.Find(L"?");
	if (sPos != -1) {
		rv.search = strUrl.Mid(sPos + 1);
		rv.path = strUrl.Left(sPos);
	}
	else 
	{
		rv.path = strUrl;
	}
	return rv;
}

bool CApplicationResources::m_bInit = false;

// static 
void CApplicationResources::Init() {
	CEF_REQUIRE_IO_THREAD();
	if (m_bInit)
		return;
	try
	{
		CDotNetRuntime::StartDesktopServices();
	}
	catch (CDotNetException& de)
	{
		de.ReportError();
	}
}

// static 
bool CApplicationResources::LoadResource(const char* szUrl, std::wstring& mime, std::string& contentDisposition,
	std::vector<byte>& data, std::vector<byte>& post, bool postMethod, int& status_code)
{
	CEF_REQUIRE_IO_THREAD();
	mime = MimeTypes[MimeIndex::html];
	//PARSE URL
	CParsedUrl parsedUrl = CParsedUrl::CreateFrom(szUrl);
	if (LoadStatic(parsedUrl.path, mime, data))
		return true;
	const wchar_t* szError = nullptr;
	try 
	{
		CDotNetRuntime::ProcessRequest(parsedUrl.path, parsedUrl.search, post, data, postMethod); // A2W_CP(postData, CP_UTF8));
		std::wstring wMimeResult = CDotNetRuntime::GetLastMime();
		std::wstring wContentDisposition = CDotNetRuntime::GetLastContentDisposition();
		status_code = CDotNetRuntime::GetLastStatusCode();
		// W2A
		mime = wMimeResult; // TODO std::wstring_convert<std::codecvt_utf8_utf16<wchar_t>, wchar_t>{}.to_bytes(wMimeResult.c_str());
		contentDisposition = std::wstring_convert<std::codecvt_utf8_utf16<wchar_t>, wchar_t>{}.to_bytes(wContentDisposition.c_str());
		return true;
	}
	catch (CDotNetException& ex) 
	{
		szError = ex.GetMessage();
	}
	if (szError) 
	{
		FillError(szError, data);
		mime = MimeTypes[MimeIndex::html];
		return true;
	}
	return false;
}

// static 
void CApplicationResources::FillError(const wchar_t* szError, std::vector<byte>& data)
{
	std::string rrResult = std::wstring_convert<std::codecvt_utf8_utf16<wchar_t>, wchar_t>{}.to_bytes(szError);
	size_t resSize = rrResult.length();
	data.resize(resSize);
	memcpy_s(data.data(), resSize, rrResult.c_str(), resSize);
}

// static
bool CApplicationResources::LoadStatic(const wchar_t* path, std::wstring& mime, std::vector<byte>& data)
{
	LPCWSTR resId = _findResourceId(path, mime);
	if (!resId)
		return false;
	HINSTANCE hInst = AfxFindResourceHandle(resId, RT_RCDATA);
	HRSRC hRsrc = ::FindResource(hInst, resId, RT_RCDATA);
	size_t resSize = (int) ::SizeofResource(hInst, hRsrc);
	HGLOBAL hGlob = ::LoadResource(hInst, hRsrc);
	data.resize(resSize);
	memcpy_s(data.data(), resSize, ::LockResource(hGlob), resSize);
	return true;
}

// static 
bool CApplicationResources::UploadFiles(const char* szUrl, const wchar_t* szFiles, std::wstring& mime, std::vector<byte>& data, bool postMethod, int& status_code)
{
	if (!postMethod)
		return false;
	CEF_REQUIRE_IO_THREAD();
	mime = MimeTypes[MimeIndex::html];
	//PARSE URL
	CParsedUrl parsedUrl = CParsedUrl::CreateFrom(szUrl);
	const wchar_t* szError = nullptr;
	try
	{
		CString strFiles(szFiles);
		CDotNetRuntime::UploadFiles(parsedUrl.path, parsedUrl.search, strFiles, data);
		std::wstring wMimeResult = CDotNetRuntime::GetLastMime();
		mime = wMimeResult; 
		status_code = CDotNetRuntime::GetLastStatusCode();
		return true;
	}
	catch (CDotNetException& ex)
	{
		szError = ex.GetMessage();
	}
	if (szError)
	{
		FillError(szError, data);
		mime = MimeTypes[MimeIndex::html];
		status_code = CDotNetRuntime::GetLastStatusCode();
		return true;
	}
	return false;
}
 