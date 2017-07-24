#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CModuleVersion : public VS_FIXEDFILEINFO 
{
protected:
   BYTE* m_pVersionInfo;   // all version info

   struct TRANSLATION 
	 {
      WORD langID;         // language ID
      WORD charset;        // character set (code page)
   } m_translation;

public:
  CModuleVersion()
		: m_pVersionInfo(NULL) {}
  virtual ~CModuleVersion();

  BOOL    GetFileVersionInfo(LPCTSTR modulename);
  CString GetValue(LPCTSTR lpKeyName);
	static long GetCurrentAppVersion();
	static CString GetCurrentFullAppVersion();
	static CString GetModuleVersionString(HINSTANCE hInstance);
};

#undef AFX_DATA
#define AFX_DATA
