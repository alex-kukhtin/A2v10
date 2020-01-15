// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.


#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

typedef unsigned __int64 DB_ID;
typedef unsigned __int64 BIG_INT;

#define EMPTYSTR  L""
#define DASH_STR  L"-"
#define BAR_STR   L"|"
#define COMMA_STR L","
#define DOT_STR   L"."
#define LF_STR    L"\n"
#define CR_STR    L"\r"
#define CRLF_STR  L"\r\n"
#define COLON_STR L":"
#define SPACE_STR L" "


#define NULL_CHR  L'\0'
#define DASH_CHR  L'-'
#define COMMA_CHR L','
#define DOT_CHR   L'.'
#define CR_CHR    L'\r'
#define LF_CHR    L'\n'
#define EQU_CHR   L'='
#define TAB_CHR   L'\t'
#define AT_CHR    L'@'
#define COLON_CHR L':'
#define STAR_CHR  L'*'
#define BAR_CHR   L'|'
#define BACKSLASH_CHR L'\\'
#define LPAR_CHR  L'('
#define RPAR_CHR  L')'
#define ZERO_CHR  L'0'
#define SPACE_CHR L' '
#define DQUOTE_CHR L'"'

#define LOPART64(l) ((DWORD)((DWORD64)(l) & 0xffffffff))
#define HIPART64(l) ((DWORD)((DWORD64)(l) >> 32))
#define MAKEDWORD64(l, h) ((((DWORD64) (ULONG) h) << 32) | ((DWORD) (ULONG) l))


#define STD_LCID (MAKELCID(MAKELANGID(LANG_ENGLISH, SUBLANG_ENGLISH_US), SORT_DEFAULT))

#define UNKNOWN_COLOR ((COLORREF)(-1))


enum TRACE_TYPE
{
	TRACE_TYPE_UNKNOWN = -1,
	TRACE_TYPE_INFO = 0,
	TRACE_TYPE_WARNING = 1,
	TRACE_TYPE_ERROR = 2,
};

enum TRACE_CATEGORY
{
	TRACE_CAT_UNK = -1,
	TRACE_CAT_GNR = 1, // general
	TRACE_CAT_LAST = 1,
};

struct TRACE_INFO
{
	TRACE_TYPE		tt;
	TRACE_CATEGORY	tc;
	LPCWSTR			szText;
	LPCWSTR			szFile;
	COleDateTime    time;
	TRACE_INFO()
		: tt(TRACE_TYPE_UNKNOWN), tc(TRACE_CAT_UNK),
		szText(NULL), szFile(NULL), time(0.0) {}
};

#define WMIC_DEBUG_MSG (WM_APP + 80)
#define WMIC_DEBUG_MSG_WPARAM   4411

struct FILL_PROPS_INFO
{
	DWORD_PTR elem;
	DWORD_PTR parent;
	HWND wndTarget;
	void* elemTarget;
	FILL_PROPS_INFO()
		: elem(0), parent(0), wndTarget(nullptr), elemTarget(nullptr)
	{}
	void Clear() {
		*this = FILL_PROPS_INFO();
	}
};

#define WM_APP_A2 (WM_APP + 80)

#define WMI_FILL_PROPS (WM_APP_A2 + 1)
#define WMI_FILL_PROPS_WPARAM 12349833
#define WMI_FILL_PROPS_RESULT_UNK    0
#define WMI_FILL_PROPS_RESULT_OK     1
#define WMI_FILL_PROPS_RESULT_REFILL 2
#define WMI_FILL_PROPS_RESULT_EMPTY  3
#define WMI_FILL_PROPS_RESULT_SKIP  -1

#define WMI_IDLE_UPDATE (WM_APP_A2 + 2)
#define WMI_IDLE_UPDATE_WPARAM 998877
#define IDLE_UPDATE_MDITABS 0x0001

#define WMI_NOTIFY		(WM_APP_A2 + 3)
#define WMIN_SOLUTION_OPENED	123
#define WMIN_SOLUTION_CLOSED	129
#define WMIN_SOLUTION_SAVED		135

#define WMI_FILL_TOOLBOX (WM_APP_A2 + 4)
#define WMI_FILL_TOOLBOX_WPARAM 991274

#define WMI_SETTINGCHANGE (WM_APP_A2 + 5)

struct PROPERTY_CHANGED_INFO {
	LPCWSTR szPropName;
	void* pSource;
	void* pJsRef;
	PROPERTY_CHANGED_INFO()
		: szPropName(nullptr), pSource(nullptr), pJsRef(nullptr) {}
};

#define WMI_PROPERTY_CHANGED (WM_APP_A2 + 6)
#define WMI_PROPERTY_CHANGED_WPARAM 990326

struct DEBUG_BREAK_INFO {
	LPCWSTR szFileName;
	int scriptId;
	int lineNo;
};

#define WMI_DEBUG_BREAK (WM_APP_A2 + 7)
#define WMI_DEBUG_BREAK_WPARAM 123098

#define WMI_CONSOLE (WM_APP_A2 + 8)
// LPARAM = message
#define WMI_CONSOLE_MIN		1123
#define WMI_CONSOLE_LOG		1123
#define WMI_CONSOLE_INFO	1124
#define WMI_CONSOLE_WARN	1125
#define WMI_CONSOLE_ERROR	1126
#define WMI_CONSOLE_MAX     1126


// LPARAM = TRUE/FALSE (ENTER, LEAVE)
#define WMI_DEBUG_MODE (WM_APP_A2 + 9)
#define WMI_DEBUG_MODE_WPARAM 992238

// UPDATE HINTS
#define HINT_DOCUMENT_SAVED     11
#define HINT_DOCUMENT_MODIFIED  12
#define HINT_INVALIDATE_ITEM    13
#define HINT_UPDATE_SELECTION   14
#define HINT_CLEAR_SELECTION    15

#define WMI_CEF_VIEW_COMMAND (WM_APP_A2 + 10)
#define WMI_CEF_VIEW_COMMAND_OPEN       44
#define WMI_CEF_VIEW_COMMAND_CREATETAB  45
#define WMI_CEF_VIEW_COMMAND_SETTILE    46

struct CEF_VIEW_INFO {
	const wchar_t* szUrl;
	const wchar_t* szTitle;
	CEF_VIEW_INFO()
		: szUrl(nullptr), szTitle(nullptr) {}
};

// LPARAM - View hWnd
#define WMI_CEF_TAB_COMMAND (WM_APP_A2 + 11)
#define WMI_CEF_TAB_COMMAND_SELECT   77
#define WMI_CEF_TAB_COMMAND_CLOSING  78
#define WMI_CEF_TAB_COMMAND_CLOSED   79
#define WMI_CEF_TAB_COMMAND_ISALLCLOSED 80


#define WMI_CEF_IDLE_UPDATE_BUTTONS (WM_APP_A2 + 12)
// (BOOL) LOWORD(LRESULT) - ENABLE_BACK, (BOOL) HIWORD(LRESULT) - ENABLE_FORWARD
#define WMI_CEF_IDLE_UPDATE_WPARAM_NAVIGATE 21123

#define WMI_POS_COMMAND_SEND (WM_APP_A2 + 13)
#define WMI_POS_COMMAND_RESULT (WM_APP_A2 + 14)

#undef AFX_DATA
#define AFX_DATA
