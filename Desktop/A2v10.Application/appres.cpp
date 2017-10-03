


#include "stdafx.h"

#include "appres.h"
#include "resource.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


struct RES_DEF
{
	LPCWSTR szName;
	UINT nRes;
	LPCSTR szMime;
};

LPCSTR mimeCss   = "text/css";
LPCSTR mimeHtml  = "text/html";
LPCSTR mimeJs    = "application/javascript";
LPCSTR mimeJson  = "application/json";
LPCSTR mimeWoff  = "application/font-woff";
LPCSTR mimeTtf   = "application/font-ttf";

const RES_DEF resArray[] =
{
	{L"app/",                   IDWEB_SITE_MAIN_HTML,		mimeHtml  },
	{L"app/admin/",             IDWEB_SITE_MAIN_HTML_ADMIN,	mimeHtml },
	{L"app/css/site.min.css",   IDWEB_SITE_MAIN_CSS,	 mimeCss   },
	{L"app/scripts/vue.js",	    IDWEB_SCRIPT_VUE_JS,	 mimeJs    },
	{L"app/scripts/main.js",	IDWEB_SCRIPT_MAIN_JS,	 mimeJs    },
	{L"app/css/fonts/bowtie.woff", IDWEB_FONT_BOWTIE_FONT,  mimeWoff },
	{L"app/css/fonts/bowtie.ttf",  IDWEB_FONT_BOWTIE_FONT2,  mimeTtf }

};

static LPCWSTR _findResourceId(LPCWSTR szUrl, LPCSTR* mime)
{
	for (int i = 0; i < _countof(resArray); i++) {
		RES_DEF rd = resArray[i];
		if (_wcsicmp(szUrl, rd.szName) == 0) {
			*mime = rd.szMime;
			return MAKEINTRESOURCE(rd.nRes);
		}
	}
	return nullptr;
}

class CParsedUrl
{
public:
	CString protocol;
	CString host;
	CString path;
	CString search;
	bool error;
	static CParsedUrl CreateFrom(LPCSTR szUrl);
	bool IsAppUrl() {
		return 
			(path.Find(L"app/_") == 0) ||
			(path.Find(L"app/admin/_") == 0);
	}

	bool IsAppData() {
		return 
			(path.Find(L"app/_data") == 0) ||
			(path.Find(L"app/admin/_data") == 0);
	}

	CString UrlToRequest() {
		CString newPath(path);
		newPath.Replace(L"app/", L"");
		return newPath;
	}
};


// static 
CParsedUrl CParsedUrl::CreateFrom(LPCSTR szUrl)
{
	CParsedUrl rv;
	rv.error = false;
	CString strUrl(szUrl);
	int pPos = strUrl.Find(L"://");
	rv.protocol = strUrl.Left(pPos);
	int sPos = strUrl.Find(L"?");
	if (sPos != -1) {
		rv.search = strUrl.Mid(sPos);
		rv.path = strUrl.Mid(pPos + 3, sPos - pPos - 3);
	}
	else 
	{
		rv.path = strUrl.Mid(pPos + 3);
	}
	return rv;
}

// static 
bool CApplicationResources::LoadResource(const char* szUrl, LPCSTR* pMime, std::vector<byte>& data, const char* postData)
{
	ATLASSERT(pMime != nullptr);
	*pMime = mimeHtml;
	//PARSE URL
	CParsedUrl parsedUrl = CParsedUrl::CreateFrom(szUrl);
	LPCWSTR szError = nullptr;
	if (parsedUrl.IsAppUrl()) {
		if (parsedUrl.IsAppData())
			*pMime = mimeJson;
		try 
		{
			CString strUrl(parsedUrl.UrlToRequest());
			// A2W
			std::wstring wPost = std::wstring_convert<std::codecvt_utf8_utf16<wchar_t>, wchar_t>{}.from_bytes(postData);
			std::wstring wResult = CDotNetRuntime::ProcessRequest(strUrl, parsedUrl.search, wPost.c_str()); // A2W_CP(postData, CP_UTF8));
			// W2A
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
	}
	if (szError) 
	{
		// W2A
		std::string rrResult = std::wstring_convert<std::codecvt_utf8_utf16<wchar_t>, wchar_t>{}.to_bytes(szError);
		size_t resSize = rrResult.length();
		data.resize(resSize);
		memcpy_s(data.data(), resSize, rrResult.c_str(), resSize);
		return true;
	}

	LPCWSTR resId = _findResourceId(parsedUrl.path, pMime);
	if (!resId) {
		// may be browse back from http:://
		resId = _findResourceId(L"app/", pMime);
		if (!resId) {
			data.resize(0);
			return false;
		}
	}
	HINSTANCE hInst = AfxFindResourceHandle(resId, RT_RCDATA);
	HRSRC hRsrc = ::FindResource(hInst, resId, RT_RCDATA);
	size_t resSize = (int) ::SizeofResource(hInst, hRsrc);
	HGLOBAL hGlob = ::LoadResource(hInst, hRsrc);
	data.resize(resSize);
	memcpy_s(data.data(), resSize, ::LockResource(hGlob), resSize);
	return true;
}
