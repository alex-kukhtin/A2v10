// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

enum TTI_TYPE {
	_tti_unknown = TTI_NONE,
	_tti_first = TTI_INFO,

	_tti_info = TTI_INFO,
	_tti_warning = TTI_WARNING,
	_tti_error = TTI_ERROR,

	_tti_last = TTI_ERROR,
};


#undef AFX_DATA
#define AFX_DATA
