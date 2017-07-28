
#include "stdafx.h"

#include "..\Include\appdefs.h"
#include "..\Include\a2glowborder.h"
#include "..\Include\a2captionbutton.h"
#include "..\Include\a2borderpane.h"
#include "..\Include\a2mdiframe.h"
#include "..\include\a2visualmanager.h"
#include "..\include\guiext.h"
#include "..\include\theme.h"
#include "..\include\uitools.h"
#include "Resource.h"


#pragma comment(lib, "dwmapi")

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

// CA2MDIFrameWnd

IMPLEMENT_DYNCREATE(CA2MDIFrameWnd, CMDIFrameWndEx)

CA2MDIFrameWnd::CA2MDIFrameWnd()
	: m_nDelta8(8), m_dwIdleFlags(0)
{
	CMFCVisualManagerOffice2003::SetUseGlobalTheme(FALSE);
	CMFCVisualManagerOffice2003::SetDefaultWinXPColors(FALSE);
}

CA2MDIFrameWnd::~CA2MDIFrameWnd()
{
}


BEGIN_MESSAGE_MAP(CA2MDIFrameWnd, CMDIFrameWndEx)
	ON_MESSAGE(WM_NCHITTEST, OnNcHitTest)
	ON_WM_PAINT()
	ON_WM_NCMOUSEMOVE()
	ON_MESSAGE(WM_SETMESSAGESTRING, OnSetMessageString)
	ON_MESSAGE(WM_IDLEUPDATECMDUI, OnIdleUpdateCmdUI)
	ON_MESSAGE(WM_NCCALCSIZE, OnNcCalcSize)
	ON_WM_NCMOUSELEAVE()
	ON_WM_ERASEBKGND()
	ON_WM_NCRBUTTONUP()
	ON_WM_NCLBUTTONDOWN()
	ON_WM_CREATE()
	ON_WM_WINDOWPOSCHANGED()
	ON_MESSAGE(WMI_IDLE_UPDATE, OnIdleUpdate)
	ON_REGISTERED_MESSAGE(AFX_WM_ON_MOVETOTABGROUP, OnMoveToTabGroup)
	ON_WM_SETTINGCHANGE()
	ON_MESSAGE(WMI_DEBUG_MODE, OnChangeDebugMode)
	ON_COMMAND(ID_WINDOW_MANAGER, OnWindowManager)
END_MESSAGE_MAP()


BOOL CA2MDIFrameWnd::CreateBorderPanes()
{
	return m_borderPanes.Create(this);
}
void CA2MDIFrameWnd::DockBorderPanes()
{
	m_borderPanes.DockPanes(this);
}

void CA2MDIFrameWnd::EnableDefaultMDITabbedGroups()
{
	CMDITabInfo mdiTabParams;
	mdiTabParams.m_style = CMFCTabCtrl::STYLE_3D_SCROLLED; // other styles available...
	mdiTabParams.m_bTabCloseButton = TRUE;
	mdiTabParams.m_bActiveTabCloseButton = TRUE;   // set to FALSE to place close button at right of tab area
	mdiTabParams.m_bTabIcons = TRUE;    // set to TRUE to enable document icons on MDI taba
	mdiTabParams.m_bAutoColor = FALSE;    // set to FALSE to disable auto-coloring of MDI tabs
	mdiTabParams.m_bDocumentMenu = TRUE; // enable the document menu at the right edge of the tab area
	mdiTabParams.m_nTabBorderSize = 1; // нужно, чтобы правильно нарисовать рамки
	mdiTabParams.m_bFlatFrame = TRUE;
	mdiTabParams.m_bReuseRemovedTabGroups = FALSE;
	EnableMDITabbedGroups(TRUE, mdiTabParams);
}

int CA2MDIFrameWnd::GetCaptionHeight()
{
	return max(::GetSystemMetrics(SM_CYCAPTION) + 4, 28);
}

void CA2MDIFrameWnd::UpdateTabs() 
{
	m_wndClientArea.UpdateTabs();
}

void CA2MDIFrameWnd::UpdateMdiTabs()
{
	// MFC BUG. Update artifacts 
	const CObList& obList = m_wndClientArea.GetMDITabGroups();
	POSITION pos = obList.GetHeadPosition();
	while (pos) {
		CMFCTabCtrl* pTab = DYNAMIC_DOWNCAST(CMFCTabCtrl, obList.GetNext(pos));
		pTab->RecalcLayout();
		pTab->EnsureVisible(pTab->GetActiveTab());
	}
}

// afx_msg
int CA2MDIFrameWnd::OnCreate(LPCREATESTRUCT lpCreateStruct)
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
void CA2MDIFrameWnd::GetMessageString(UINT nID, CString& rMessage) const
{
	if (nID == 0)
		return;
	__super::GetMessageString(nID, rMessage); // needed for tooltip
}

// virtual 
void CA2MDIFrameWnd::AdjustDockingLayout(HDWP hdwp /*= NULL*/)
{
	__super::AdjustDockingLayout(hdwp);
	RecalcLayout(); // always
}

// virtual 
void CA2MDIFrameWnd::RecalcLayout(BOOL bNotify /*= TRUE*/)
{
	if (m_bInRecalcLayout)
		return;
	CRect winRect(0, 0, 200, 200);
	AdjustWindowRectEx(winRect, WS_OVERLAPPEDWINDOW, FALSE, WS_EX_APPWINDOW);
	m_nDelta8 = (winRect.Width() - 200) / 2;
	BOOL bZoomed = IsZoomed(); // GetStyle() & WS_MAXIMIZE;
	CRect clientRect;
	GetClientRect(clientRect);
	int cyCaption = GetCaptionHeight();
	CRect captionRect = clientRect;
	captionRect.bottom = captionRect.top + cyCaption;
	if (bZoomed) {
		m_dockManager.m_rectInPlace = clientRect;
		m_dockManager.m_rectInPlace.DeflateRect(m_nDelta8, cyCaption + m_nDelta8, m_nDelta8, m_nDelta8);
		captionRect.OffsetRect(-m_nDelta8, m_nDelta8);
		m_captionButtons.RecalcLayout(captionRect, bZoomed);
		__super::RecalcLayout(bNotify);
		return;
	}
	m_dockManager.m_rectInPlace = clientRect;
	// caption only!!!
	m_dockManager.m_rectInPlace.DeflateRect(0, cyCaption, 0, 0);
	m_captionButtons.RecalcLayout(captionRect, bZoomed);
	__super::RecalcLayout(bNotify);

	// MFC BUG. Update artifacts 
	const CObList& obList = m_wndClientArea.GetMDITabGroups();
	POSITION pos = obList.GetHeadPosition();
	while (pos) {
		CMFCTabCtrl* pTab = DYNAMIC_DOWNCAST(CMFCTabCtrl, obList.GetNext(pos));
		pTab->Invalidate();
	}
}

// afx_msg 
void CA2MDIFrameWnd::OnWindowPosChanged(WINDOWPOS* lpwndpos)
{
	__super::OnWindowPosChanged(lpwndpos);
	m_glowBorder.OnWindowPosChanged(this);
	Invalidate();
}

// afx_msg 
LRESULT CA2MDIFrameWnd::OnNcCalcSize(WPARAM wParam, LPARAM lParam)
{
	return 0;
}

// afx_msg
LRESULT CA2MDIFrameWnd::OnMoveToTabGroup(WPARAM, LPARAM)
{
	// MFC BUG. Update artifacts 
	RecalcLayout();
	UpdateMdiTabs();
	return 0L;
}

// afx_msg 
LRESULT CA2MDIFrameWnd::OnNcHitTest(WPARAM wParam, LPARAM lParam)
{
	CPoint pt(lParam);
	CRect wr;
	GetWindowRect(wr);
	int cyCaption = GetCaptionHeight();
	int dxIcon = (cyCaption - 24) / 2;
	if (pt.y < (wr.top + cyCaption)) {
		if (pt.x < (wr.left + cyCaption + dxIcon * 2))
			return HTSYSMENU;
		else if (pt.x > wr.right - m_captionButtons.Width())
			return HTOBJECT;
		else
			return HTCAPTION;
	}
	return HTNOWHERE;
}

// afx_msg
void CA2MDIFrameWnd::OnNcRButtonUp(UINT nHitTest, CPoint point)
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

// afx_msg
void CA2MDIFrameWnd::OnNcLButtonDown(UINT nHitTest, CPoint point)
{
	__super::OnNcLButtonDown(nHitTest, point);
	if (nHitTest == HTOBJECT) {
		ScreenToClient(&point);
		m_captionButtons.PressButton(point, this);
	}
}


// afx_msg 
void CA2MDIFrameWnd::OnNcMouseMove(UINT nHitTest, CPoint point)
{
	__super::OnNcMouseMove(nHitTest, point);
	if (nHitTest == HTOBJECT) {
		ScreenToClient(&point);
		if (m_captionButtons.MouseMove(point))
			InvalidateRect(m_captionButtons.GetRect());
	}
	else {
		if (m_captionButtons.ClearHighlight())
			InvalidateRect(m_captionButtons.GetRect());
	}
}

// afx_msg 
void CA2MDIFrameWnd::OnNcMouseLeave()
{
	__super::OnNcMouseLeave();
	if (m_captionButtons.ClearHighlight())
		InvalidateRect(m_captionButtons.GetRect());
}


// afx_msg
void CA2MDIFrameWnd::OnPaint()
{
	CPaintDC dc(this);
	CRect rc;
	GetClientRect(rc);

	BOOL bMax = IsZoomed();

	int cyCaption = GetCaptionHeight();
	int dxIcon = (cyCaption - 24) / 2;
	int iconOrigin = 0;

	CRect captionRect(rc.left, rc.top, rc.right, rc.top + cyCaption);
	if (bMax) {
		captionRect.OffsetRect(m_nDelta8, m_nDelta8);
		iconOrigin = m_nDelta8;
	}

	auto pVm = DYNAMIC_DOWNCAST(CA2VisualManager, CMFCVisualManager::GetInstance());
	if (pVm)
		dc.FillRect(captionRect, pVm->GetWindowCaptionBackgroundBrush()); // menu bar background
																		  //dc.Draw3dRect(captionRect, RGB(255, 255, 0), RGB(255, 255, 0));

	dc.SetBkMode(TRANSPARENT);
	CFont* pOldFont = dc.SelectObject(CTheme::GetUIFont(CTheme::FontNonClient));
	captionRect.left += cyCaption + dxIcon * 2;
	CString str;
	GetWindowText(str);
	dc.SetTextColor(RGB(0x33, 0x33, 0x33)); /***???**/
	captionRect.right -= m_captionButtons.Width();
	dc.DrawText(str, captionRect, DT_LEFT | DT_VCENTER | DT_SINGLELINE | DT_END_ELLIPSIS);
	dc.SelectObject(pOldFont);
	static HICON hIcon = NULL;
	if (hIcon == NULL) {
		hIcon = (HICON) ::LoadImage(AfxGetInstanceHandle(), MAKEINTRESOURCE(IDR_MAINFRAME), IMAGE_ICON, 24, 24, 0);
	}
	::DrawIconEx(dc.GetSafeHdc(), iconOrigin + dxIcon * 2, iconOrigin + dxIcon, hIcon, 24, 24, 0, NULL, DI_NORMAL);
	m_captionButtons.Draw(&dc);
}

// afx_msg
LRESULT CA2MDIFrameWnd::OnIdleUpdate(WPARAM wParam, LPARAM lParam)
{
	if (wParam == WMI_IDLE_UPDATE_WPARAM)
		m_dwIdleFlags |= lParam;
	return 0L;
}

// afx_msg
LRESULT CA2MDIFrameWnd::OnIdleUpdateCmdUI(WPARAM, LPARAM)
{
	m_dockManager.SendMessageToMiniFrames(WM_IDLEUPDATECMDUI);
	if (m_dwIdleFlags & IDLE_UPDATE_MDITABS) {
		UpdateMdiTabs();
		m_dwIdleFlags &= ~IDLE_UPDATE_MDITABS;
	}
	return 0L;
}

// afx_msg
BOOL CA2MDIFrameWnd::OnEraseBkgnd(CDC* pDC)
{
	return TRUE;
}

// virtual 
void CA2MDIFrameWnd::OnDebugModeChanged(bool bDebug)
{

}

// afx_msg
LRESULT CA2MDIFrameWnd::OnSetMessageString(WPARAM wParam, LPARAM lParam)
{
	UINT nIDLast = m_nIDLastMessage;
	m_nIDLastMessage = (UINT)wParam;    // new ID (or 0)
	m_nIDTracking = (UINT)wParam;       // so F1 on toolbar buttons work
	return nIDLast;
}


// virtual  
BOOL CA2MDIFrameWnd::OnCmdMsg(UINT nID, int nCode, void* pExtra, AFX_CMDHANDLERINFO* pHandlerInfo)
{
	if (CUITools::TryDoCmdMsg(nID, nCode, pExtra, pHandlerInfo))
		return TRUE;
	return __super::OnCmdMsg(nID, nCode, pExtra, pHandlerInfo);
}

void CA2MDIFrameWnd::OnSettingChange(UINT uFlags, LPCTSTR lpszSection)
{
	__super::OnSettingChange(uFlags, lpszSection);
	CTheme::OnSettingChange();
	SendMessageToDescendants(WMI_SETTINGCHANGE, WPARAM(uFlags), (LPARAM)lpszSection, TRUE, TRUE);
}

// afx_msg
LRESULT CA2MDIFrameWnd::OnChangeDebugMode(WPARAM wParam, LPARAM lParam) 
{
	if (wParam != WMI_DEBUG_MODE_WPARAM)
		return 0L;
	auto pVm = DYNAMIC_DOWNCAST(CA2VisualManager, CMFCVisualManager::GetInstance());
	bool bMode = lParam ? true : false;
	if (pVm->SetDebugMode(bMode))
		OnDebugModeChanged(bMode);
	return 0L;
}

void CA2MDIFrameWnd::OnWindowManager()
{
	ShowWindowsDialog();
}
