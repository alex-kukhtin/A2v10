// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"

#include "cefscheme.h"
#include "appres.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

// virutal
CClientSchemeHandler::~CClientSchemeHandler() 
{

}

std::string GetMimeFromString(const char* szString)
{
	// ANSI!
	std::string result;
	CStringA hdrString(szString);
	hdrString.MakeLower();
	int ctPos = hdrString.Find("content-type:");
	if (ctPos == -1)
		return result;
	hdrString = hdrString.Mid(ctPos + 14);
	int colonPos = hdrString.FindOneOf(";\r\n");
	if (colonPos != -1) {
		result = hdrString.Left(colonPos).Trim();
	}
	return result;
}

bool CClientSchemeHandler::ProcessRequest(CefRefPtr<CefRequest> request,
	CefRefPtr<CefCallback> callback)
{
	CEF_REQUIRE_IO_THREAD();

	CApplicationResources::Init();

	bool handled = false;
	std::string url = request->GetURL();
	std::string method = request->GetMethod();
	std::vector<byte> post_;
	bool isPost = false;

	std::string _files;

	if (method == "POST") 
	{
		isPost = true;
		auto rt = request->GetResourceType();
		CefRequest::HeaderMap headerMap;
		//request->GetHeaderMap(headerMap);
		CefRefPtr<CefPostData> postData = request->GetPostData();
		if (postData != nullptr) {
			size_t postCnt = postData->GetElementCount();
			if (postCnt != 0) {
				CefPostData::ElementVector elems;				
				postData->GetElements(elems);
				for (auto it=elems.begin(); it != elems.end(); ++it) {
					CefPostDataElement* elem = *it;
					auto type = elem->GetType();
					if (type == cef_postdataelement_type_t::PDE_TYPE_BYTES) {
						size_t bytes = elem->GetBytesCount();
						post_.resize(bytes);
						elem->GetBytes(bytes, (void*)post_.data());
					}
					else if (type == cef_postdataelement_type_t::PDE_TYPE_FILE) {
						std::string fileName = elem->GetFile();
						// fileName is a full path for file
						std::string hdr = GetMimeFromString((const char*)post_.data());
						std::string fileToUpload(fileName.c_str());
						fileToUpload += "\b" + hdr + "\t";
						_files += fileToUpload;
					}
				}
			}
		}
	}

	std::string mime;
	bool rc = false;

	if (_files.length() > 0)
		rc = CApplicationResources::UploadFiles(url.c_str(), _files.c_str(), mime, data_, isPost);
	else
		rc = CApplicationResources::LoadResource(url.c_str(), mime, data_, post_, isPost);
	if (rc) {
		mime_type_ = mime;
		handled = true;
	}
	else 
	{
		std::string error = "file not found: ";
		error += url;
		size_t resSize = error.length();
		data_.resize(resSize);
		memcpy_s(data_.data(), resSize, error.c_str(), resSize);
		mime_type_ = mime;
		handled = true;
	}
	if (handled && callback != nullptr) {
		callback->Continue();
		return true;
	}
	return false;
}

// virtual 
void CClientSchemeHandler::GetResponseHeaders(CefRefPtr<CefResponse> response,
	int64& response_length,
	CefString& redirectUrl)
{
	CEF_REQUIRE_IO_THREAD();
	DCHECK(!data_.empty());

	response->SetMimeType(mime_type_);
	response->SetStatus(200);
	// TODO: setHeaderMaps

	// Set the resulting response length.
	response_length = data_.size();
}

// virtual 
bool CClientSchemeHandler::ReadResponse(void* data_out,
	int bytes_to_read,
	int& bytes_read,
	CefRefPtr<CefCallback> callback)
{
	CEF_REQUIRE_IO_THREAD();

	bool has_data = false;
	bytes_read = 0;

	if (offset_ < data_.size()) {
		// Copy the next block of data into the buffer.
		int transfer_size =
			min(bytes_to_read, static_cast<int>(data_.size() - offset_));
		memcpy(data_out, data_.data() + offset_, transfer_size);
		offset_ += transfer_size;

		bytes_read = transfer_size;
		has_data = true;
	}
	//if (has_data && callback)
		//callback->Continue();
	return has_data;
}

//Implementation of the factory for creating scheme handlers.
class ClientSchemeHandlerFactory : public CefSchemeHandlerFactory {
public:
	ClientSchemeHandlerFactory() {}

	// Return a new scheme handler instance to handle the request.
	CefRefPtr<CefResourceHandler> Create(CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		const CefString& scheme_name,
		CefRefPtr<CefRequest> request) OVERRIDE 
	{
		CEF_REQUIRE_IO_THREAD();
		return new CClientSchemeHandler();
	}

private:
	IMPLEMENT_REFCOUNTING(ClientSchemeHandlerFactory);
	DISALLOW_COPY_AND_ASSIGN(ClientSchemeHandlerFactory);
};

// static
void CClientSchemeHandler::RegisterSchemaHandlerFactory()
{
	//CefRegisterSchemeHandlerFactory("http", "app",
		//new ClientSchemeHandlerFactory());
	CefRegisterSchemeHandlerFactory(L"http", L"domain",
		new ClientSchemeHandlerFactory());
}
