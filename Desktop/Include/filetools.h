// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

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
	static bool LoadFile(LPCWSTR szFileName, CString& text);
	static bool SaveFileUTF8(LPCWSTR szFileName, LPCWSTR szText);
	static CString CombinePath(LPCWSTR szPath1, LPCWSTR szPath2);
};

#undef AFX_DATA
#define AFX_DATA

