#pragma once

class CClientSchemeHandler : public CefResourceHandler
{
public:
	CClientSchemeHandler() : offset_(0)
	{
	}
	virtual bool ProcessRequest(CefRefPtr<CefRequest> request,
		CefRefPtr<CefCallback> callback) override;
	virtual void GetResponseHeaders(CefRefPtr<CefResponse> response,
		int64& response_length,
		CefString& redirectUrl);
	virtual bool ReadResponse(void* data_out,
		int bytes_to_read,
		int& bytes_read,
		CefRefPtr<CefCallback> callback);
	virtual void Cancel() {};
	static void RegisterSchemaHandlerFactory();
private:
	std::vector<byte> data_;
	std::string mime_type_;
	size_t offset_;

	IMPLEMENT_REFCOUNTING(CClientSchemeHandler);
	DISALLOW_COPY_AND_ASSIGN(CClientSchemeHandler);
};

