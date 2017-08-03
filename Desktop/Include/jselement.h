#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA


class CJsElement : public CObject 
{
public:
	virtual JsValueRef GetJsHandle() = 0;
	virtual void OnPropertyChanged(LPCWSTR szPropName);
};

#undef AFX_DATA
#define AFX_DATA
