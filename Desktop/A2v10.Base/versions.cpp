
#include "stdafx.h"

#include "..\include\versions.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#pragma comment(lib,"version.lib")

CModuleVersion::~CModuleVersion()
{
	if (m_pVersionInfo)
		delete [] m_pVersionInfo;
}

BOOL CModuleVersion::GetFileVersionInfo(LPCTSTR modulename)
{
	if (m_pVersionInfo) {
		delete[] m_pVersionInfo;
		m_pVersionInfo = NULL;
	}

	m_translation.charset = 1252;    // default = US ANSI code page
	memset((VS_FIXEDFILEINFO*)this, 0, sizeof(VS_FIXEDFILEINFO));

	// get module handle
	WCHAR filename[_MAX_PATH];
	lstrcpy(filename, modulename);
	if (!::PathFileExists(filename))
		return FALSE;

	// read file version info
	DWORD dwDummyHandle; // will always be set to zero
	DWORD len = GetFileVersionInfoSize(filename, &dwDummyHandle);
	if (len <= 0)
		return FALSE;

	m_pVersionInfo = new BYTE[len]; // allocate version info
	if (!::GetFileVersionInfo(filename, 0, len, m_pVersionInfo))
		return FALSE;

	LPVOID lpvi;
	UINT iLen;
	if (!VerQueryValue(m_pVersionInfo, _TEXT("\\"), &lpvi, &iLen))
		return FALSE;

	// copy fixed info to myself, which am derived from VS_FIXEDFILEINFO
	*(VS_FIXEDFILEINFO*)this = *(VS_FIXEDFILEINFO*)lpvi;

	// Get translation info
	if (VerQueryValue(m_pVersionInfo,
		L"\\VarFileInfo\\Translation", &lpvi, &iLen) && iLen >= 4) {
		m_translation = *(TRANSLATION*)lpvi;
		ATLTRACE(L"code page = %d\n", m_translation.charset);
	}

	return dwSignature == VS_FFI_SIGNATURE;
}

CString CModuleVersion::GetValue(LPCTSTR lpKeyName)
{
	CString sVal;
	if (m_pVersionInfo) {

		// To get a string value must pass query in the form
		//
		//    "\StringFileInfo\<langID><codepage>\keyname"
		//
		// where <langID><codepage> is the languageID concatenated with the
		// code page, in hex. Wow.
		//
		CString query;
		query.Format(L"\\StringFileInfo\\%04x%04x\\%s",
			m_translation.langID,
			m_translation.charset,
			lpKeyName);

		LPCTSTR pVal;
		UINT iLenVal;
		if (VerQueryValue(m_pVersionInfo, (LPTSTR)(LPCTSTR)query,
			(LPVOID*)&pVal, &iLenVal)) {

			sVal = pVal;
		}
	}
	return sVal;
}

// static 
long CModuleVersion::GetCurrentAppVersion()
{
	CModuleVersion ver;

	WCHAR  szFullPath[MAX_PATH];
	::GetModuleFileName(::AfxGetInstanceHandle(), szFullPath, sizeof(szFullPath));
	if (ver.GetFileVersionInfo(szFullPath)) {
		return (long)ver.dwFileVersionLS;
	}
	return 0L;
}

// static
CString CModuleVersion::GetModuleVersionString(HINSTANCE hInstance)
{
	CString s;
	WCHAR szFullPath[MAX_PATH];
	::GetModuleFileName(hInstance, szFullPath, sizeof(szFullPath));
	CModuleVersion ver;
	if (ver.GetFileVersionInfo(szFullPath)) {
		// Version
		s.Format(L"%d.%d.%04d", (int)HIWORD(ver.dwFileVersionMS), (int)LOWORD(ver.dwFileVersionMS), (int)LOWORD(ver.dwFileVersionLS));
	}
	return s;
}

// static 
CString CModuleVersion::GetCurrentFullAppVersion()
{
	CString s;
	CModuleVersion ver;

	WCHAR  szFullPath[MAX_PATH];
	::GetModuleFileName(::AfxGetInstanceHandle(), szFullPath, sizeof(szFullPath));
	if (ver.GetFileVersionInfo(szFullPath))
	{
		int i0 = (int)HIWORD(ver.dwFileVersionMS);
		int i1 = (int)LOWORD(ver.dwFileVersionMS);
		int b0 = (int)HIWORD(ver.dwFileVersionLS);
		int b1 = (int)LOWORD(ver.dwFileVersionLS);
		// i0.i1.b0.b1
		s.Format(L"%d.%d.%d", i0, i1, b1);
	}
	return s;
}
