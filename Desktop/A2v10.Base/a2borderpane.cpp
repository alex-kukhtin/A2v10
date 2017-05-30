
#include "stdafx.h"
#include "../Include/a2borderpane.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif

IMPLEMENT_DYNAMIC(CA2BorderPane, CPane)


BOOL CA2BorderPanes::Create(CWnd* pParent)
{
	DWORD dwGapStyle = WS_CHILD | WS_VISIBLE | CBRS_SIZE_FIXED |
		CCS_NOPARENTALIGN | CCS_NOMOVEY | CCS_NODIVIDER | CCS_NORESIZE;

	CRect rect(0, 0, 0, 0);
	if (!m_wndLeftGap.Create(NULL, dwGapStyle | CBRS_LEFT, rect, pParent, IDW_GAPBAR_LEFT))
		return FALSE;
	if (!m_wndRightGap.Create(NULL, dwGapStyle | CBRS_RIGHT, rect, pParent, IDW_GAPBAR_TOP))
		return FALSE;
	if (!m_wndTopGap.Create(NULL, dwGapStyle | CBRS_TOP, rect, pParent, IDW_GAPBAR_RIGHT))
		return FALSE;
	if (!m_wndBottomGap.Create(NULL, dwGapStyle | CBRS_BOTTOM, rect, pParent, IDW_GAPBAR_BOTTOM))
		return FALSE;
	return TRUE;
}

void CA2BorderPanes::DockPanes(CMDIFrameWndEx* pFrame)
{
	pFrame->DockPane(&m_wndTopGap, AFX_IDW_DOCKBAR_TOP);
	pFrame->DockPane(&m_wndBottomGap, AFX_IDW_DOCKBAR_BOTTOM);
	pFrame->DockPane(&m_wndLeftGap, AFX_IDW_DOCKBAR_LEFT);
	pFrame->DockPane(&m_wndRightGap, AFX_IDW_DOCKBAR_RIGHT);
}


void CA2BorderPanes::DockPanes(CFrameWndEx* pFrame)
{
	pFrame->DockPane(&m_wndTopGap, AFX_IDW_DOCKBAR_TOP);
	pFrame->DockPane(&m_wndBottomGap, AFX_IDW_DOCKBAR_BOTTOM);
	pFrame->DockPane(&m_wndLeftGap, AFX_IDW_DOCKBAR_LEFT);
	pFrame->DockPane(&m_wndRightGap, AFX_IDW_DOCKBAR_RIGHT);
}

