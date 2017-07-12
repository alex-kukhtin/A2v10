
#include "stdafx.h"

#include "sciview.h"
#include "moduleview.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


CModuleView::CModuleView()
	: m_nCurrentLineHandle(-1) 
{
}

// virtual 
CModuleView::~CModuleView() 
{

}


IMPLEMENT_DYNCREATE(CModuleView, CJsEditView)


BEGIN_MESSAGE_MAP(CModuleView, CJsEditView)
	ON_MESSAGE(WMI_DEBUG_BREAK, OnWmiDebugBreak)
	ON_COMMAND(ID_DEBUG_RUN, OnDebugRun)
	ON_COMMAND(ID_DEBUG_RUN_INT, OnDebugRunInt)
END_MESSAGE_MAP()


// afx_msg
void CModuleView::OnDebugRun() {
	if (JavaScriptRuntime::InDebugMode()) {
		// continue
		JavaScriptRuntime::SetDebugMode(false);
	}
	else 
	{
		PostMessage(WM_COMMAND, ID_DEBUG_RUN_INT, 0L);
	}
}

/// afx_msg 
void CModuleView::OnDebugRunInt() 
{
	CString code = GetText();
	if (code.IsEmpty())
		return;

	CString pathName = GetDocument()->GetPathName();
	SetReadOnly(true);
	JavaScriptContext jscs;
	bool bClosing = false;
	try 
	{
		bClosing = JavaScriptRuntime::RunScript(code, pathName);
	}
	catch (JavaScriptException& ex) 
	{
		ex.ReportError();
	}
	if (bClosing)
		return; // DO NOTHING! shutting down!
	// may be destroyed inside debugger
	if (GetSafeHwnd()) {
		RemoveCurrentLineMarker();
		SetReadOnly(false); 
	}
}

void CModuleView::RemoveCurrentLineMarker() 
{
	if (m_nCurrentLineHandle != -1)
		SendMessage(SCI_MARKERDELETEHANDLE, m_nCurrentLineHandle);
}
// afx_msg
LRESULT CModuleView::OnWmiDebugBreak(WPARAM wParam, LPARAM lParam)
{
	if (wParam != WMI_DEBUG_BREAK_WPARAM)
		return 0L;
	DEBUG_BREAK_INFO* pBreakInfo = reinterpret_cast<DEBUG_BREAK_INFO*>(lParam);
	if (!pBreakInfo)
		return 0;
	CMDIChildWnd* pFrame = reinterpret_cast<CMDIChildWnd*>(GetParent());
	pFrame->MDIActivate();
	//GetParent()->SendMessage(WM_MDIACTIVATE, (WPARAM)GetSafeHwnd());
	SetFocus();
	RemoveCurrentLineMarker();
	m_nCurrentLineHandle = SendMessage(SCI_MARKERADD, pBreakInfo->lineNo, MARKER_CURRENT_LINE);
	SendMessage(SCI_ENSUREVISIBLE, pBreakInfo->lineNo); // unfold
	SendMessage(SCI_GOTOLINE, pBreakInfo->lineNo);
	SendMessage(SCI_SCROLLCARET, 0, 0L); // scroll into
	return 0L;
}
