// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.


#include "stdafx.h"

#include "appres.h"
#include "resource.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


const char* MimeTypes[] = 
{
	/*0*/ "text/html",
	/*1*/ "text/css",
	/*2*/ "application/javascript",
	/*3*/ "application/json",
	/*4*/ "application/font-woff",
	/*5*/ "application/font-ttf",
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

static LPCWSTR _findResourceId(LPCWSTR szUrl, LPCSTR* mime)
{
	for (int i = 0; i < _countof(resArray); i++) {
		RES_DEF rd = resArray[i];
		if (_wcsicmp(szUrl, rd.szName) == 0) {
			*mime = MimeTypes[rd.eMime];
			return MAKEINTRESOURCE(rd.nRes);
		}
	}
	return nullptr;
}

static const char* _findMime(std::string& sample) {
	for (int i = 0; i < _countof(MimeTypes); i++) {
		const char* curMime = MimeTypes[i];
		if (sample == curMime)
			return curMime;
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

// static 
bool CApplicationResources::LoadResource(const char* szUrl, const char** pMime, std::vector<byte>& data, const char* postData)
{
	ATLASSERT(pMime != nullptr);
	*pMime = MimeTypes[MimeIndex::html];
	//PARSE URL
	CParsedUrl parsedUrl = CParsedUrl::CreateFrom(szUrl);
	if (LoadStatic(parsedUrl.path, pMime, data))
		return true;
	LPCWSTR szError = nullptr;
	try 
	{
		// A2W
		std::wstring wPost = std::wstring_convert<std::codecvt_utf8_utf16<wchar_t>, wchar_t>{}.from_bytes(postData);
		int mimeIndex = 0;
		std::wstring wResult = CDotNetRuntime::ProcessRequest(parsedUrl.path, parsedUrl.search, wPost.c_str()); // A2W_CP(postData, CP_UTF8));
		std::wstring wMimeResult = CDotNetRuntime::GetLastMime();
		// W2A
		std::string currentMime = std::wstring_convert<std::codecvt_utf8_utf16<wchar_t>, wchar_t>{}.to_bytes(wMimeResult.c_str());
		*pMime = _findMime(currentMime);
		std::string rrResult = std::wstring_convert<std::codecvt_utf8_utf16<wchar_t>, wchar_t>{}.to_bytes(wResult.c_str());
		size_t resSize = rrResult.length();
		data.resize(resSize);
		if (resSize != 0)
			memcpy_s(data.data(), resSize, rrResult.c_str(), resSize);
		return true;
	}
	catch (CDotNetException& ex) 
	{
		szError = ex.GetMessage();
	}
	if (szError) 
	{
		// W2A
		std::string rrResult = std::wstring_convert<std::codecvt_utf8_utf16<wchar_t>, wchar_t>{}.to_bytes(szError);
		size_t resSize = rrResult.length();
		data.resize(resSize);
		memcpy_s(data.data(), resSize, rrResult.c_str(), resSize);
		*pMime = MimeTypes[MimeIndex::html];
		return true;
	}
	return false;
}

// static
bool CApplicationResources::LoadStatic(const wchar_t* path, const char** pMime, std::vector<byte>& data)
{
	LPCWSTR resId = _findResourceId(path, pMime);
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
