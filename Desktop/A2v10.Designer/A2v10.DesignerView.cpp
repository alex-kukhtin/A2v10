
// A2v10.DesignerView.cpp : implementation of the CA2v10DesignerView class
//

#include "stdafx.h"
// SHARED_HANDLERS can be defined in an ATL project implementing preview, thumbnail
// and search filter handlers and allows sharing of document code with that project.
#ifndef SHARED_HANDLERS
#include "A2v10.Designer.h"
#endif

#include "A2v10.DesignerDoc.h"
#include "A2v10.DesignerView.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// CA2v10DesignerView

IMPLEMENT_DYNCREATE(CA2v10DesignerView, CView)

BEGIN_MESSAGE_MAP(CA2v10DesignerView, CView)
	// Standard printing commands
	ON_COMMAND(ID_FILE_PRINT, &CView::OnFilePrint)
	ON_COMMAND(ID_FILE_PRINT_DIRECT, &CView::OnFilePrint)
	ON_COMMAND(ID_FILE_PRINT_PREVIEW, &CA2v10DesignerView::OnFilePrintPreview)
	ON_WM_CONTEXTMENU()
	ON_WM_RBUTTONUP()
END_MESSAGE_MAP()

// CA2v10DesignerView construction/destruction

CA2v10DesignerView::CA2v10DesignerView()
{
	// TODO: add construction code here

}

CA2v10DesignerView::~CA2v10DesignerView()
{
}

BOOL CA2v10DesignerView::PreCreateWindow(CREATESTRUCT& cs)
{
	// TODO: Modify the Window class or styles here by modifying
	//  the CREATESTRUCT cs

	return CView::PreCreateWindow(cs);
}

// CA2v10DesignerView drawing

void CA2v10DesignerView::OnDraw(CDC* /*pDC*/)
{
	CA2v10DesignerDoc* pDoc = GetDocument();
	ASSERT_VALID(pDoc);
	if (!pDoc)
		return;

	// TODO: add draw code for native data here
}


// CA2v10DesignerView printing


void CA2v10DesignerView::OnFilePrintPreview()
{
#ifndef SHARED_HANDLERS
	AFXPrintPreview(this);
#endif
}

BOOL CA2v10DesignerView::OnPreparePrinting(CPrintInfo* pInfo)
{
	// default preparation
	return DoPreparePrinting(pInfo);
}

void CA2v10DesignerView::OnBeginPrinting(CDC* /*pDC*/, CPrintInfo* /*pInfo*/)
{
	// TODO: add extra initialization before printing
}

void CA2v10DesignerView::OnEndPrinting(CDC* /*pDC*/, CPrintInfo* /*pInfo*/)
{
	// TODO: add cleanup after printing
}

void CA2v10DesignerView::OnRButtonUp(UINT /* nFlags */, CPoint point)
{
	ClientToScreen(&point);
	OnContextMenu(this, point);
}

void CA2v10DesignerView::OnContextMenu(CWnd* /* pWnd */, CPoint point)
{
#ifndef SHARED_HANDLERS
	theApp.GetContextMenuManager()->ShowPopupMenu(IDR_POPUP_EDIT, point.x, point.y, this, TRUE);
#endif
}


// CA2v10DesignerView diagnostics

#ifdef _DEBUG
void CA2v10DesignerView::AssertValid() const
{
	CView::AssertValid();
}

void CA2v10DesignerView::Dump(CDumpContext& dc) const
{
	CView::Dump(dc);
}

CA2v10DesignerDoc* CA2v10DesignerView::GetDocument() const // non-debug version is inline
{
	ASSERT(m_pDocument->IsKindOf(RUNTIME_CLASS(CA2v10DesignerDoc)));
	return (CA2v10DesignerDoc*)m_pDocument;
}
#endif //_DEBUG


// CA2v10DesignerView message handlers
