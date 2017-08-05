
#include "stdafx.h"

#include "../include/filetools.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


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
				LoadTextFromFile(file, text, CP_UTF8);
			}
		}
		else
		{
			file.SeekToBegin();
			LoadTextFromFile(file, text);
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

bool CFileTools::LoadTextFromFile(CFile& file, CString& text, UINT codePage /*= CP_UTF8*/)
{
	text.Empty();
	int nLen = (int) file.GetLength();
	if (nLen == 0)
		return true; // empty file
	LPVOID hText = ::LocalAlloc(LMEM_MOVEABLE, static_cast<UINT>(::ATL::AtlMultiplyThrow(static_cast<UINT>(nLen + 1), static_cast<UINT>(sizeof(WCHAR)))));
	if (hText == NULL)
		AfxThrowMemoryException();
	LPSTR lpszText = (LPSTR) ::LocalLock(hText); // ANSI
	file.Read(lpszText, nLen);
	lpszText[nLen] = '\0'; // ANSI!
	LPWSTR szUniText = text.GetBuffer(nLen);
	szUniText[0] = L'\0'; // UNICODE
	int ret = ::MultiByteToWideChar(codePage, 0, lpszText, nLen, szUniText, nLen);
	::LocalUnlock(hText);
	::LocalFree(hText);
	if (ret == 0) {
		DWORD dwLastError = GetLastError();
		TRACE(traceAppMsg, 0, "Failed to CFileTools::LoadAnsiFile::MultiByteToWideChar! Last error is 0x%8.8X\n", dwLastError);
		text.ReleaseBufferSetLength(0);
		return false;
	}
	text.ReleaseBufferSetLength(ret);
	return true;
}
