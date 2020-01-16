
// stdafx.h : include file for standard system include files,
// or project specific include files that are used frequently,
// but are changed infrequently

#pragma once

#ifndef VC_EXTRALEAN
#define VC_EXTRALEAN            // Exclude rarely-used stuff from Windows headers
#endif

#include "targetver.h"

#define _ATL_CSTRING_EXPLICIT_CONSTRUCTORS      // some CString constructors will be explicit

// turns off MFC's hiding of some common and often safely ignored warning messages
#define _AFX_ALL_WARNINGS

#include "string"
#include "locale"
#include "codecvt"
#include "list"
#include "vector"
#include "algorithm"

#include <afxwin.h>         // MFC core and standard components
#include <afxext.h>         // MFC extensions



#ifndef _AFX_NO_OLE_SUPPORT
#include <afxdtctl.h>           // MFC support for Internet Explorer 4 Common Controls
#endif
#ifndef _AFX_NO_AFXCMN_SUPPORT
#include <afxcmn.h>             // MFC support for Windows Common Controls
#endif // _AFX_NO_AFXCMN_SUPPORT

#include <afxcontrolbars.h>     // MFC support for ribbons and control bars
#include <afxdialogex.h>

#include "../include/A2v10.Base.h"
#include "../include/A2v10.Net.Shim.h"


#include "include/base/cef_lock.h"
#include "include/cef_client.h"
#include "include/cef_urlrequest.h"
#include "include/cef_app.h"
#include "include/cef_stream.h"
#include "include/cef_resource_handler.h"
#include "include/cef_browser_process_handler.h"
#include "Include/cef_v8.h"
#include "include/views/cef_browser_view.h"
#include "include/wrapper/cef_helpers.h"
#include "include/wrapper/cef_resource_manager.h"
#include "include/wrapper/cef_stream_resource_handler.h"
#include "Include/cef_parser.h"
#include "A2v10.StaticBase/staticbase.h"
#include "A2v10.PosTerm/posterm.h"

#ifdef _UNICODE
#if defined _M_IX86
#pragma comment(linker,"/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='x86' publicKeyToken='6595b64144ccf1df' language='*'\"")
#elif defined _M_X64
#pragma comment(linker,"/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='amd64' publicKeyToken='6595b64144ccf1df' language='*'\"")
#else
#pragma comment(linker,"/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='*' publicKeyToken='6595b64144ccf1df' language='*'\"")
#endif
#endif


