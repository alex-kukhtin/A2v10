#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA


struct CFilePath
{
	CString m_drive;
	CString m_dir;
	CString m_name;
	CString m_ext;
};

class CFileTools
{
private:
	CFileTools(void); // declaration only
	~CFileTools(void);
public:
	static void SplitPath(LPCWSTR szPath, CFilePath& path);
	static bool LoadTextFromFile(CFile& file, CString& text, UINT codePage = CP_UTF8);
	static bool LoadFile(LPCWSTR szFileName, CString& text);
};

#undef AFX_DATA
#define AFX_DATA

