#pragma once


class CallbackItem {
public:
	CallbackItem()
		: key() {}
	int key;
	CefRefPtr<CefV8Context> context;
	CefRefPtr<CefV8Value> onSuccess;
	CefRefPtr<CefV8Value> onFailure;
};

class CallbackMap : CList<CallbackItem*, CallbackItem*&>
{
	static CallbackMap s_map;
	static int s_key;
	CCriticalSection m_cs;
public:
	static CallbackMap* Current();
	int Add(CefRefPtr<CefV8Context> context, CefRefPtr<CefV8Value> onSuccess);
	CallbackItem* Pop();
	bool Process(int key, LPCWSTR szResult);
};


