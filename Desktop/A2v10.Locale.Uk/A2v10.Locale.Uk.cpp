
#include "stdafx.h"
#include <afxwin.h>
#include <afxdllx.h>

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

static AFX_EXTENSION_MODULE A2v10LocaleUkDLL = { NULL, NULL };

extern "C" int APIENTRY
DllMain(HINSTANCE hInstance, DWORD dwReason, LPVOID lpReserved)
{
	// Remove this if you use lpReserved
	UNREFERENCED_PARAMETER(lpReserved);

	if (dwReason == DLL_PROCESS_ATTACH)
	{
		TRACE0("A2v10.Locale.Uk.dll initializing!\n");

		// Extension DLL one-time initialization
		if (!AfxInitExtensionModule(A2v10LocaleUkDLL, hInstance))
			return 0;

		// Insert this DLL into the resource chain
		new CDynLinkLibrary(A2v10LocaleUkDLL);

	}
	else if (dwReason == DLL_PROCESS_DETACH)
	{
		TRACE0("A2v10.Locale.Uk.dll terminating!\n");

		// Terminate the library before destructors are called
		AfxTermExtensionModule(A2v10LocaleUkDLL);
	}
	return 1;   // ok
}

