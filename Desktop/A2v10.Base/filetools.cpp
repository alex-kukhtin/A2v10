
#include "stdafx.h"

#include "../include/filetools.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


class CFileToolsImpl
{
public:
	static bool LoadTextFromFile(int offset, CFile& file, CString& text, UINT codePage = CP_UTF8);
	static void SaveTextToFile(CFile& file, LPCWSTR szText, UINT codePage = CP_UTF8);
};

// static 
void CFileTools::SplitPath(LPCWSTR szPath, CFilePath& path)
{
	CString strFullPath(szPath);
	WCHAR drive[_MAX_DRIVE];
	WCHAR dir[_MAX_DIR];
	WCHAR fname[_MAX_FNAME];
	WCHAR ext[_MAX_EXT];
	_wsplitpath_s(strFullPath,
		drive, _MAX_DRIVE,
		dir, _MAX_DIR,
		fname, _MAX_FNAME,
		ext, _MAX_EXT
	);
	path.m_drive = drive;
	path.m_dir = dir;
	path.m_name = fname;
	path.m_ext = ext;
}

// static 
bool CFileTools::LoadFile(LPCWSTR szFileName, CString& text)
{
	text.Empty();
	CFile file;
	CFileException fe;
	try {
		if (!file.Open(szFileName,
			CFile::modeRead | CFile::typeBinary | CFile::shareDenyWrite, &fe)) {
			fe.ReportError();
			return false;
		}
		WORD hdr = 0;
		file.Read(&hdr, 2);
		if (hdr == 0xFEFF)
		{
			int nLen = (int)file.GetLength() - 2; /*уже прочитали*/
			LPWSTR szUniText = text.GetBuffer(nLen);
			file.Read(szUniText, nLen);
			int textLen = nLen / sizeof(WCHAR);
			szUniText[textLen] = L'\0'; // UNICODE
			text.ReleaseBufferSetLength(textLen);
		}
		else if (hdr == 0xBBEF)
		{
			BYTE r3 = 0;
			file.Read(&r3, 1);
			if (r3 == 0xBF) {
				// UTF 8 file with signature
				CFileToolsImpl::LoadTextFromFile(3, file, text, CP_UTF8);
			}
		}
		else
		{
			file.SeekToBegin();
			CFileToolsImpl::LoadTextFromFile(0, file, text);
		}
	}
	catch (CFileException* e) 
	{
		e->ReportError();
		e->Delete();
		return false;
	}
	return true;
}

// static 
bool CFileTools::SaveFileUTF8(LPCWSTR szFileName, LPCWSTR szText)
{
	if (!szFileName || !*szFileName)
		return false;
	CFile file;
	CFileException e;
	CFileStatus fs;

	try {
		if (!file.Open(szFileName, CFile::modeWrite | CFile::modeCreate | CFile::shareDenyWrite, &e)) {
			e.ReportError();
			return false;
		}
		CFileToolsImpl::SaveTextToFile(file, szText, CP_UTF8);
		file.Close();
	}
	catch (CFileException* e) {
		e->ReportError();
		e->Delete();
		return false;
	}
	return true;
}

bool CFileToolsImpl::LoadTextFromFile(int offset, CFile& file, CString& text, UINT codePage /*= CP_UTF8*/)
{
	text.Empty();
	int nLen = (int) file.GetLength() - offset;
	if (nLen <= 0)
		return true; // empty file
	LPVOID hText = ::LocalAlloc(LMEM_MOVEABLE, static_cast<UINT>(::ATL::AtlMultiplyThrow(static_cast<UINT>(nLen + 1), static_cast<UINT>(sizeof(WCHAR)))));
	if (hText == NULL)
		AfxThrowMemoryException();
	LPSTR lpszText = (LPSTR) ::LocalLock(hText); // ANSI
	file.Read(lpszText, nLen);
	lpszText[nLen] = '\0'; // ANSI!
	LPWSTR szUniText = text.GetBuffer(nLen);
	szUniText[0] = L'\0'; // wide
	int ret = ::MultiByteToWideChar(codePage, 0, lpszText, nLen, szUniText, nLen);
	szUniText[ret] = L'\0'; // wide
	text.ReleaseBufferSetLength(ret);
	::LocalUnlock(hText);
	::LocalFree(hText);
	if (ret == 0) {
		DWORD dwLastError = GetLastError();
		TRACE(traceAppMsg, 0, "Failed to CFileTools::LoadAnsiFile::MultiByteToWideChar! Last error is 0x%8.8X\n", dwLastError);
		text.ReleaseBufferSetLength(0);
		return false;
	}
	return true;
}

// static 
void CFileToolsImpl::SaveTextToFile(CFile& file, LPCWSTR szText, UINT codePage /*= CP_UTF8*/)
{
	// header
	if (codePage == CP_UTF8) {
		BYTE hdr[3] = {0xEF, 0xBB, 0xBF};
		file.Write(hdr, 3);
	}

	USES_CONVERSION;
	LPCSTR szUtf8 = W2A_CP(szText, CP_UTF8);
	int len = strlen(szUtf8);
	file.Write(szUtf8, len);
}
