// Copyright © 2008-2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"

#include "..\Include\appdefs.h"
#include "..\Include\a2glowborder.h"
#include "..\Include\a2captionbutton.h"
#include "..\Include\a2borderpane.h"
#include "..\Include\a2sdiframebase.h"
#include "..\include\a2visualmanager.h"
#include "..\include\guiext.h"
#include "..\include\theme.h"
#include "..\include\uitools.h"
#include "Resource.h"


#pragma comment(lib, "dwmapi")

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

// CA2SDIFrameWndBase

IMPLEMENT_DYNCREATE(CA2SDIFrameWndBase, CFrameWndEx)

CA2SDIFrameWndBase::CA2SDIFrameWndBase()
	: m_nDelta8(8), m_dwIdleFlags(0)
{
	CMFCVisualManagerOffice2003::SetUseGlobalTheme(FALSE);
	CMFCVisualManagerOffice2003::SetDefaultWinXPColors(FALSE);
}

CA2SDIFrameWndBase::~CA2SDIFrameWndBase()
{
}

BEGIN_MESSAGE_MAP(CA2SDIFrameWndBase, CFrameWndEx)
	ON_MESSAGE(WM_NCCALCSIZE, OnNcCalcSize)
	ON_WM_NCMOUSELEAVE()
	ON_WM_ERASEBKGND()
	ON_WM_CREATE()
	ON_WM_NCRBUTTONUP()
	ON_WM_WINDOWPOSCHANGED()
	ON_MESSAGE(WMI_IDLE_UPDATE, OnIdleUpdate)
	ON_WM_SETTINGCHANGE()
END_MESSAGE_MAP()

BOOL CA2SDIFrameWndBase::CreateBorderPanes()
{
	return m_borderPanes.Create(this);
}
void CA2SDIFrameWndBase::DockBorderPanes()
{
	m_borderPanes.DockPanes(this);
}

// afx_msg
int CA2SDIFrameWndBase::OnCreate(LPCREATESTRUCT lpCreateStruct)
{

	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;

	if (!m_glowBorder.Create(this))
		return -1;

	CMFCMenuBar::EnableMenuShadows(FALSE);
	ModifyStyle(0, WS_CLIPCHILDREN, 0);
	ModifyStyleEx(WS_EX_CLIENTEDGE, WS_EX_APPWINDOW | WS_EX_WINDOWEDGE);

	MARGINS margins = { 0, 0, 0, 0 };
	HRESULT hr = ::DwmExtendFrameIntoClientArea(GetSafeHwnd(), &margins);
	if (!SUCCEEDED(hr)) {
		//ATLASSERT(FALSE);
	}

	return 0;
}

// virtual
int CA2SDIFrameWndBase::GetCaptionHeight()
{
	return max(::GetSystemMetrics(SM_CYCAPTION) + 4, 28);
}

// virtual 
void CA2SDIFrameWndBase::AdjustDockingLayout(HDWP hdwp /*= NULL*/)
{
	__super::AdjustDockingLayout(hdwp);
	RecalcLayout(); // always
}


// afx_msg 
void CA2SDIFrameWndBase::OnWindowPosChanged(WINDOWPOS* lpwndpos)
{
	__super::OnWindowPosChanged(lpwndpos);
	m_glowBorder.OnWindowPosChanged(this);
	Invalidate();
}

// afx_msg 
LRESULT CA2SDIFrameWndBase::OnNcCalcSize(WPARAM wParam, LPARAM lParam)
{
	return 0;
}

void CA2SDIFrameWndBase::OnSettingChange(UINT uFlags, LPCTSTR lpszSection)
{
	__super::OnSettingChange(uFlags, lpszSection);
	CTheme::OnSettingChange();
	SendMessageToDescendants(WMI_SETTINGCHANGE, WPARAM(uFlags), (LPARAM)lpszSection, TRUE, TRUE);
}

// afx_msg
LRESULT CA2SDIFrameWndBase::OnIdleUpdate(WPARAM wParam, LPARAM lParam)
{
	if (wParam == WMI_IDLE_UPDATE_WPARAM)
		m_dwIdleFlags |= lParam;
	return 0L;
}

// afx_msg
BOOL CA2SDIFrameWndBase::OnEraseBkgnd(CDC* pDC)
{
	return TRUE;
}

// virtual  
BOOL CA2SDIFrameWndBase::OnCmdMsg(UINT nID, int nCode, void* pExtra, AFX_CMDHANDLERINFO* pHandlerInfo)
{
	if (CUITools::TryDoCmdMsg(nID, nCode, pExtra, pHandlerInfo))
		return TRUE;
	return __super::OnCmdMsg(nID, nCode, pExtra, pHandlerInfo);
}

// afx_msg
void CA2SDIFrameWndBase::OnNcRButtonUp(UINT nHitTest, CPoint point)
{
	if (nHitTest != HTCAPTION)
		return;
	CMenu* pMenu = GetSystemMenu(FALSE);
	if (pMenu->GetSafeHmenu() != NULL && ::IsMenu(pMenu->GetSafeHmenu()))
	{
		pMenu->EnableMenuItem(SC_MAXIMIZE, MF_BYCOMMAND | MF_ENABLED);
		pMenu->EnableMenuItem(SC_RESTORE, MF_BYCOMMAND | MF_ENABLED);

		if (IsZoomed())
		{
			pMenu->EnableMenuItem(SC_MAXIMIZE, MF_BYCOMMAND | MF_DISABLED | MF_GRAYED);
		}
		else if (!IsIconic())
		{
			pMenu->EnableMenuItem(SC_RESTORE, MF_BYCOMMAND | MF_DISABLED | MF_GRAYED);
		}

		UINT uiRes = ::TrackPopupMenu(pMenu->GetSafeHmenu(), TPM_LEFTBUTTON | TPM_RETURNCMD, point.x, point.y, 0, GetSafeHwnd(), NULL);
		if (uiRes != 0)
		{
			PostMessage(WM_SYSCOMMAND, uiRes);
		}
	}
}

