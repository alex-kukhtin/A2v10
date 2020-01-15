
// Copyright © 2020 Alex Kukhtin. All rights reserved.


#include "stdafx.h"
#include "callbackmap.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif

// static
CallbackMap CallbackMap::s_map;
int CallbackMap::s_key = 0;

// static
CallbackMap* CallbackMap::Current()
{
	return &s_map;
}

int CallbackMap::Add(CefRefPtr<CefV8Context> context, CefRefPtr<CefV8Value> onSuccess)
{
	m_cs.Lock();
	s_key++;
	int key = s_key;
	CallbackItem* pItem = new CallbackItem();
	pItem->context = context;
	pItem->onSuccess = onSuccess;
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

bool CallbackMap::Process(int key, LPCWSTR result)
{
	CallbackItem* pItem = Pop();
	if (pItem && pItem->key == key) {
		CefV8ValueList args;
		CefRefPtr<CefV8Value> val = CefV8Value::CreateString(result);
		args.push_back(val);
		pItem->onSuccess->ExecuteFunctionWithContext(pItem->context, nullptr, args);
		delete pItem;
		return true;
	}
	return false;
}
