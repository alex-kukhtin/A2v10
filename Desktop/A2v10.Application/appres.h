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
	static bool LoadResource(const char* url, std::string& mime, std::vector<byte>& data, std::vector<byte>& post, bool postMethod);
	static bool LoadStatic(const wchar_t* path, std::string& mime, std::vector<byte>& data);
	static bool UploadFiles(const char* url, const char* szFiles, std::string& mime, std::vector<byte>& data, bool postMethod);
private:
	static void CApplicationResources::FillError(const wchar_t* szError, std::vector<byte>& data);
};
