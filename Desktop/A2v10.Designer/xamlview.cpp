

#include "stdafx.h"

#include "sciview.h"
#include "formitem.h"
#include "a2formdoc.h"
#include "xamlview.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

IMPLEMENT_DYNCREATE(CFormXamlView, CXamlEditView)


CA2FormDocument* CFormXamlView::GetDocument() const
{
	return reinterpret_cast<CA2FormDocument*>(m_pDocument);
}


// virtual 
void CFormXamlView::SavePointLeft()
{
	GetDocument()->SetModifiedText();
}

// virtual 
void CFormXamlView::OnActivateView(BOOL bActivate, CView* pActivateView, CView* pDeactiveView)
{
	__super::OnActivateView(bActivate, pActivateView, pDeactiveView);
	if (bActivate) {
		CA2FormDocument* pDoc = GetDocument();
		if (pDoc->IsModifiedXml()) {
			// xml was modified -> set new text
			pDoc->SetXmlTextFromXml();
		}
	}
}

