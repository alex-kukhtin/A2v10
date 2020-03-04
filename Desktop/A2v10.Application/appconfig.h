#pragma once



class CAppConfigFiscalPrinter : public JsonTarget
{
public:
	std::wstring m_model;
	std::wstring m_port;
	int m_baud;

	CAppConfigFiscalPrinter();

protected:
	BEGIN_JSON_PROPS(3)
		STRING_PROP(model, m_model)
		STRING_PROP(port, m_port)
		INT_PROP(baud, m_baud)
	END_JSON_PROPS()
};

class CAppConfigAcqTerminal : public JsonTarget
{
public:
	std::wstring _model;
	std::wstring _port;
	std::wstring _log;
protected:
	BEGIN_JSON_PROPS(3)
		STRING_PROP(model, _model)
		STRING_PROP(port,  _port)
		STRING_PROP(log,   _log)
	END_JSON_PROPS()
};

class CAppConfig : public JsonTarget
{
public:
	std::wstring m_connectionString;
	std::wstring m_startUrl;
	JsonTargetTypedArray<CAppConfigFiscalPrinter> m_fiscalPrinters;
	JsonTargetTypedArray<CAppConfigAcqTerminal> m_acqTerminals;

	bool HasFiscalPrinters() const { return m_fiscalPrinters.size() > 0; }
	bool HasAcqTerminals() const { return m_acqTerminals.size() > 0; }

	bool ConnectToPrinter();
	bool ConnectToAcquiringTerminal();
	void ShutDown();
	bool NeedBackgroundThread();

protected:
	BEGIN_JSON_PROPS(4)
		STRING_PROP(connectionString, m_connectionString)
		STRING_PROP(startUrl, m_startUrl)
		ARRAY_PROP(fiscalPrinters, m_fiscalPrinters)
		ARRAY_PROP(acquiringTerminals, m_acqTerminals)
	END_JSON_PROPS()
};
