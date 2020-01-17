#pragma once

template<class T>
class JsonTargetTypedArray : public CArray<T*, T*>, public JsonTargetArray
{
public:
	virtual ~JsonTargetTypedArray()
	{
		for (int i = 0; i < GetCount(); i++)
			delete ElementAt(i);
		RemoveAll();
	}
	//  json target array
	virtual JsonTarget* CreateObject(const wchar_t* szName)
	{
		T* pItem = new T();
		Add(pItem);
		return pItem;

	}
};


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

class CAppConfig : public JsonTarget
{
public:
	std::wstring m_connectionString;
	std::wstring m_startUrl;
	JsonTargetTypedArray<CAppConfigFiscalPrinter> m_fiscalPrinters;

	bool HasFiscalPrinters() const { return m_fiscalPrinters.GetCount() > 0; }

	bool ConnectToPrinter();

protected:
	BEGIN_JSON_PROPS(3)
		STRING_PROP(connectionString, m_connectionString)
		STRING_PROP(startUrl, m_startUrl)
		ARRAY_PROP(fiscalPrinters, m_fiscalPrinters)
	END_JSON_PROPS()
};
