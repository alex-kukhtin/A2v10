
#include "stdafx.h"

#include "a2formdoc.h"
#include "a2formtab.h"

#include "a2formview.h"
#include "sciview.h"
#include "xamlview.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


IMPLEMENT_DYNCREATE(CA2FormTabView, CA2TabView)


// virtual
void CA2FormTabView::OnCreate()
{
	CString strTitle = L"  Design  ";
	AddView(RUNTIME_CLASS(CA2FormView), strTitle);
	strTitle = L"  XAML  ";
	AddView(RUNTIME_CLASS(CFormXamlView), strTitle);
	//strTitle = L"  Code  ";
	//AddView(RUNTIME_CLASS(CJsEditView), strTitle);
}


