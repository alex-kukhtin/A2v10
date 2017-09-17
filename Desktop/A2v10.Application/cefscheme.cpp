
#include "stdafx.h"

#include "cefscheme.h"
#include "appres.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

bool CClientSchemeHandler::ProcessRequest(CefRefPtr<CefRequest> request,
	CefRefPtr<CefCallback> callback)
{
	CEF_REQUIRE_IO_THREAD();

	bool handled = false;
	std::string url = request->GetURL();
	std::string method = request->GetMethod();
	std::string post;
	if (method == "POST") 
	{
		CefRefPtr<CefPostData> postData = request->GetPostData();
		if (postData != nullptr) {
			size_t postCnt = postData->GetElementCount();
			if (postCnt != 0) {
				CefPostData::ElementVector elems;
				postData->GetElements(elems);
				for (auto it=elems.begin(); it != elems.end(); ++it) {
					CefPostDataElement* elem = *it;
					size_t bytes = elem->GetBytesCount();
					post.resize(bytes);
					elem->GetBytes(bytes, (void*)post.data());
				}
			}
		}
	}

	const char* mime = nullptr;
	bool rc = CApplicationResources::LoadResource(url.c_str(), &mime, data_, post.c_str());
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
	if (handled) {
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
		CefRefPtr<CefRequest> request) OVERRIDE {
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
	CefRegisterSchemeHandlerFactory("http", "app",
		new ClientSchemeHandlerFactory());
}
