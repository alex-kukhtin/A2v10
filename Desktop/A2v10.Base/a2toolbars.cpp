
#include "stdafx.h"

#include "../Include/a2toolbars.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// virtual 
int CA2MFCMenuBar::GetRowHeight() const
{
	return __super::GetRowHeight();
}

// virtual 
void CA2MFCToolBar::OnUpdateCmdUI(CFrameWnd* pTarget, BOOL bDisableIfNoHndler)
{
	if (m_bUpdateCmdUiByOwner)
		__super::OnUpdateCmdUI((CFrameWnd*)GetOwner(), bDisableIfNoHndler);
	else
		__super::OnUpdateCmdUI(pTarget, bDisableIfNoHndler);
}

