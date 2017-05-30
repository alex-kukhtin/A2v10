
#include "stdafx.h"

#include "a2tabbedpane.h"
#include "../Include/a2glowborder.h"
#include "a2miniframewnd.h"


#ifdef _DEBUG
#define new DEBUG_NEW
#endif


IMPLEMENT_SERIAL(CA2TabbedPane, CTabbedPane, 0)

CA2TabbedPane::CA2TabbedPane(BOOL bAutoDestroy /*= FALSE*/)
	: CTabbedPane(bAutoDestroy)
{
}

CA2TabbedPane::~CA2TabbedPane()
{
}


BEGIN_MESSAGE_MAP(CA2TabbedPane, CTabbedPane)
	ON_WM_CREATE()
END_MESSAGE_MAP()

int CA2TabbedPane::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;

	SetMiniFrameRTC(RUNTIME_CLASS(CA2MiniFrameWnd));
	return 0L;
}
