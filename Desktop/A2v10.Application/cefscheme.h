#pragma once

class CClientSchemeHandler : public CefResourceHandler
{
public:
	CClientSchemeHandler() 
		: offset_(0), status_code_(0) {}
	virtual ~CClientSchemeHandler();

	virtual bool ProcessRequest(CefRefPtr<CefRequest> request,
		CefRefPtr<CefCallback> callback) override;
	virtual void GetResponseHeaders(CefRefPtr<CefResponse> response,
		int64& response_length,
		CefString& redirectUrl) override;
	virtual bool ReadResponse(void* data_out,
		int bytes_to_read,
		int& bytes_read,
		CefRefPtr<CefCallback> callback) override;
	virtual void Cancel() override {};
	static void RegisterSchemaHandlerFactory();
private:
	std::vector<byte> data_;
	std::string mime_type_;
	std::string content_disposition_;
	size_t offset_;
	int status_code_;

	IMPLEMENT_REFCOUNTING(CClientSchemeHandler);
	DISALLOW_COPY_AND_ASSIGN(CClientSchemeHandler);
};

