#pragma once


struct FileInfo {
	CString fileName;
	CString mimeType;
};

class CApplicationResources
{
	static bool m_bInit;
public:
	static void Init();
	static bool LoadResource(const char* url, std::wstring& mime, std::string& contentDisposition, std::vector<byte>& data, std::vector<byte>& post, bool postMethod, int& status_code);
	static bool LoadStatic(const wchar_t* path, std::wstring& mime, std::vector<byte>& data);
	static bool UploadFiles(const char* url, const wchar_t* szFiles, std::wstring& mime, std::vector<byte>& data, bool postMethod, int& status_code);
private:
	static void CApplicationResources::FillError(const wchar_t* szError, std::vector<byte>& data);
};
