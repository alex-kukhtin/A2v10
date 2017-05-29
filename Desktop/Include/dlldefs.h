#pragma once

#ifndef AFX_BASE_DATA
#ifdef _BASEEXT
#define AFX_BASE_CLASS       AFX_CLASS_EXPORT
#define AFX_BASE_API         AFX_API_EXPORT
#define AFX_BASE_DATA        AFX_DATA_EXPORT
#else
#define AFX_BASE_CLASS       AFX_CLASS_IMPORT
#define AFX_BASE_API         AFX_API_IMPORT
#define AFX_BASE_DATA        AFX_DATA_IMPORT
#endif
#endif


