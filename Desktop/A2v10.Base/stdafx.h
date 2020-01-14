// Copyright © 2008-2020 Alex Kukhtin. All rights reserved.

// stdafx.h : include file for standard system include files,
// or project specific include files that are used frequently, but
// are changed infrequently

#pragma once

#ifndef VC_EXTRALEAN
#define VC_EXTRALEAN            // Exclude rarely-used stuff from Windows headers
#endif

#include "targetver.h"

#define _ATL_CSTRING_EXPLICIT_CONSTRUCTORS      // some CString constructors will be explicit

#include <afxwin.h>         // MFC core and standard components
#include <afxext.h>         // MFC extensions

#include "string"
#include "locale"
#include "codecvt"
#include "list"
#include "algorithm"

#include <afxcontrolbars.h>     // MFC support for ribbons and control bars
#include <afxautohidedocksite.h>

#include <atlbase.h>

#include "..\include\allresources.h"

// JAVASCRIPT
#include "stdint.h"
#include "..\include\ChakraCore.h"

