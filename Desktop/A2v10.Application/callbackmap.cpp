
// Copyright © 2020 Alex Kukhtin. All rights reserved.


#include "stdafx.h"
#include "callbackmap.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif

// static
CallbackMap CallbackMap::s_map;

int _nextKey() {
	const int MAX_KEY_VALUE = 16383;
	static int s_key = 0;
	s_key++;
	if (s_key > MAX_KEY_VALUE)
		s_key = 1;
	return s_key;
}

// static
CallbackMap* CallbackMap::Current()
{
	return &s_map;
}

int CallbackMap::Add(CefRefPtr<CefV8Context> context, CefRefPtr<CefV8Value> onSuccess, CefRefPtr<CefV8Value> onFail)
{
	m_cs.Lock();
	int key = _nextKey();
	CallbackItem* pItem = new CallbackItem();
	pItem->context = context;
	pItem->onSuccess = onSuccess;
	pItem->onFailure = onFail;
	pItem->key = key;
	AddTail(pItem);
	m_cs.Unlock();
	return key;
}

CallbackItem* CallbackMap::Pop()
{
	CallbackItem* pItem = nullptr;
	m_cs.Lock();
	if (GetCount() != 0)
		pItem = RemoveHead();
	m_cs.Unlock();
	return pItem;
}

bool CallbackMap::Process(WPARAM wParam, LPCWSTR result)
{
	int key = LOWORD(wParam);
	int success = HIWORD(wParam);
	CallbackItem* pItem = Pop();
	if (pItem && pItem->key == key) {
		CefV8ValueList args;
		CefRefPtr<CefV8Value> val = CefV8Value::CreateString(result);
		args.push_back(val);
		if (success)
			pItem->onSuccess->ExecuteFunctionWithContext(pItem->context, nullptr, args);
		else
			pItem->onFailure->ExecuteFunctionWithContext(pItem->context, nullptr, args);
		delete pItem;
		return true;
	}
	return false;
}
