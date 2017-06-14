#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class JavaScriptNative sealed
{
public:
	static void ThrowIfError(JsErrorCode error);
};

#undef AFX_DATA
#define AFX_DATA


