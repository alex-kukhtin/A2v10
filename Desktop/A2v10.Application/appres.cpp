


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
LPCSTR mimeJs    = "application/ecmascript";
LPCSTR mimeWoff2 = "application/font-woff2";

const RES_DEF resArray[] =
{
	{L"app/",                   IDWEB_SITE_MAIN_HTML,	 mimeHtml  },
	{L"app/css/site.min.css",   IDWEB_SITE_MAIN_CSS,	 mimeCss   },
	{L"app/scripts/vue.js",	    IDWEB_SCRIPT_VUE_JS,	 mimeJs    },
	{L"app/scripts/main.js",	IDWEB_SCRIPT_MAIN_JS,	 mimeJs    },
	{L"app/fonts/bowtie.woff2", IDWEB_FONT_BOWTIE_FONT,  mimeWoff2 }

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
		return path.Find(L"app/_page") == 0;
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
const byte* CApplicationResources::LoadResource(LPCSTR szUrl, LPCSTR* pMime, int& resSize)
{
	ATLASSERT(pMime != nullptr);
	*pMime = mimeHtml;
	resSize = 0;
	//PARSE URL
	CParsedUrl parsedUrl = CParsedUrl::CreateFrom(szUrl);
	if (parsedUrl.IsAppUrl()) {
		LPCSTR szError = "<div><div>page not found.<br><a href=\"https://www.google.com.ua/\">Find!</a></div></div>";
		resSize = strlen(szError);
		return (byte*) szError;
	}
	LPCWSTR resId = _findResourceId(parsedUrl.path, pMime);
	if (!resId) {
		// may be browse back from http:://
		resId = _findResourceId(L"app/", pMime);
		if (!resId)
			return nullptr;
	}
	HINSTANCE hInst = AfxFindResourceHandle(resId, RT_RCDATA);
	HRSRC hRsrc = ::FindResource(hInst, resId, RT_RCDATA);
	resSize = (int) ::SizeofResource(hInst, hRsrc);
	HGLOBAL hGlob = ::LoadResource(hInst, hRsrc);
	return (const byte*) ::LockResource(hGlob); // binary;
}
