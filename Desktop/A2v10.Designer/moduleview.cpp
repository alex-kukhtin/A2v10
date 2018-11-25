// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

#include "stdafx.h"

#include "sciview.h"
#include "moduleview.h"
#include "moduledoc.h"

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
	ON_MESSAGE(WMI_FILL_PROPS, OnWmiFillProps)
	ON_MESSAGE(WMI_DEBUG_MODE, OnChangeDebugMode)
	ON_COMMAND(ID_DEBUG_RUN, OnDebugRun)
	ON_COMMAND(ID_DEBUG_RUN_INT, OnDebugRunInt)
	ON_COMMAND(ID_DEBUG_STEP_INTO, OnDebugStepInto)
	ON_COMMAND(ID_DEBUG_STEP_OVER, OnDebugStepOver)
	ON_COMMAND(ID_DEBUG_STEP_OUT, OnDebugStepOut)
END_MESSAGE_MAP()


// afx_msg
void CModuleView::OnDebugRun() {
	if (JavaScriptRuntime::InDebugMode()) {
		// continue
		JavaScriptRuntime::SetDebugStepType(DebugStepType::Continue);
		JavaScriptRuntime::SetDebugMode(false);
	}
	else 
	{
		PostMessage(WM_COMMAND, ID_DEBUG_RUN_INT, 0L);
	}
}

// afx_msg 
void CModuleView::OnDebugStepInto() 
{
	if (!JavaScriptRuntime::InDebugMode())
		return;
	JavaScriptRuntime::SetDebugStepType(DebugStepType::StepIn);
	JavaScriptRuntime::SetDebugMode(false);
}

// afx_msg 
void CModuleView::OnDebugStepOver()
{
	if (!JavaScriptRuntime::InDebugMode())
		return;
	JavaScriptRuntime::SetDebugStepType(DebugStepType::StepOver);
	JavaScriptRuntime::SetDebugMode(false);
}

void CModuleView::OnDebugStepOut() 
{
	if (!JavaScriptRuntime::InDebugMode())
		return;
	JavaScriptRuntime::SetDebugStepType(DebugStepType::StepOut);
	JavaScriptRuntime::SetDebugMode(false);
}

/// afx_msg 
void CModuleView::OnDebugRunInt() 
{
	std::wstring code = GetText();
	if (code.empty())
		return;

	CString pathName = GetDocument()->GetPathName();
	SetReadOnly(true);
	JavaScriptContext jscs; // new scope
	bool bClosing = false;
	// TODO:: ?? SaveAll
	try
	{
		CDotNetRuntime::LoadModuleContext();
		auto ctx = JavaScriptValue::GlobalObject().GetProperty(L"__context");
		CFilePath path;
		CFileTools::SplitPath(pathName, path);
		ctx.SetProperty(L"_dir_", JavaScriptValue::FromString(path.m_drive + path.m_dir));
		ctx.SetProperty(L"_file_", JavaScriptValue::FromString(path.m_name + path.m_ext));
		bClosing = JavaScriptRuntime::RunScript(code.c_str(), pathName);
	}
	catch (JavaScriptException& ex) 
	{
		ex.ReportError();
	}
	if (bClosing)
		return; // DO NOTHING! shutting down!
	JavaScriptRuntime::EndRunScript();
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
	SetReadOnly(true);
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

// afx_msg
LRESULT CModuleView::OnWmiFillProps(WPARAM wParam, LPARAM lParam)
{
	if (wParam != WMI_FILL_PROPS_WPARAM)
		return 0L;
	auto pDoc = GetDocument();
	FILL_PROPS_INFO* pInfo = reinterpret_cast<FILL_PROPS_INFO*>(lParam);
	pInfo->wndTarget = GetSafeHwnd();
	pInfo->elemTarget = pDoc;
	pInfo->elem = reinterpret_cast<DWORD_PTR>(pDoc->GetJsHandle());
	pInfo->parent = 0;
	return (LRESULT)WMI_FILL_PROPS_RESULT_OK;
}

// afx_msg
LRESULT CModuleView::OnChangeDebugMode(WPARAM wParam, LPARAM lParam)
{
	if (wParam != WMI_DEBUG_MODE_WPARAM)
		return 0L;
	auto pVm = DYNAMIC_DOWNCAST(CA2VisualManager, CMFCVisualManager::GetInstance());
	bool bMode = lParam ? true : false;
	SetReadOnly(bMode);
	if (GetSafeHwnd() && !bMode)
		RemoveCurrentLineMarker();
	return 0L;
}
