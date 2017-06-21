

#include "stdafx.h"

// SHARED_HANDLERS can be defined in an ATL project implementing preview, thumbnail
// and search filter handlers and allows sharing of document code with that project.
#ifndef SHARED_HANDLERS
#include "A2v10.Designer.h"
#endif

#include "a2formdoc.h"
#include "a2formview.h"
//#include "formtool.h"
#include "recttracker.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#define OFFSET_VIEWPORT_ROOT 10


IMPLEMENT_DYNCREATE(CA2FormView, CScrollView)

BEGIN_MESSAGE_MAP(CA2FormView, CScrollView)
	ON_WM_SETCURSOR()
	ON_WM_ERASEBKGND()
	ON_MESSAGE(WMI_FILL_TOOLBOX, OnWmiFillToolbox)
	ON_MESSAGE(WMI_FILL_PROPS, OnWmiFillProps)
	ON_WM_CREATE()
	ON_WM_LBUTTONDOWN()
	ON_COMMAND_RANGE(ID_TOOLBOX_FIRST, ID_TOOLBOX_LAST, OnTool)
	ON_UPDATE_COMMAND_UI_RANGE(ID_TOOLBOX_FIRST, ID_TOOLBOX_LAST, OnUpdateTool)
	ON_COMMAND(ID_EDIT_CLEAR, OnEditClear)
	ON_UPDATE_COMMAND_UI(ID_EDIT_CLEAR, OnUpdateEditClear)
	// Standard printing commands
	//ON_COMMAND(ID_FILE_PRINT, OnFilePrint)
	//ON_COMMAND(ID_FILE_PRINT_DIRECT, OnFilePrint)
	//ON_COMMAND(ID_FILE_PRINT_PREVIEW, OnFilePrintPreview)

END_MESSAGE_MAP()

CA2FormView::CA2FormView()
{

}

CA2FormView::~CA2FormView()
{
}

BOOL CA2FormView::PreCreateWindow(CREATESTRUCT& cs)
{
	// TODO: Modify the Window class or styles here by modifying
	//  the CREATESTRUCT cs
	return __super::PreCreateWindow(cs);
}

// virtual  
BOOL CA2FormView::OnCmdMsg(UINT nID, int nCode, void* pExtra, AFX_CMDHANDLERINFO* pHandlerInfo)
{
	if (CUITools::TryDoCmdMsg(nID, nCode, pExtra, pHandlerInfo))
		return TRUE;
	return __super::OnCmdMsg(nID, nCode, pExtra, pHandlerInfo);
}

void CA2FormView::OnUpdate(CView* pSender, LPARAM lHint, CObject* pHint)
{
	/*
	if (GetDocument()->IsLoading())
		return;
	switch (lHint)
	{
	case HINT_SET_SIZES:
	{
		SetDocumentSize();
		Invalidate();
	}
	break;
	case HINT_SELECT_ITEM:
	case HINT_CREATE_ITEM:
	case HINT_INVALIDATE_ITEM:
	{
		CFormItem* pItem = reinterpret_cast<CFormItem*>(pHint);
		if (pItem) {
			CRect rect(pItem->GetPosition());
			DocToClient(rect);
			rect.InflateRect(CX_HANDLE_SIZE, CX_HANDLE_SIZE);
			InvalidateRect(rect);
		}
	}
	break;
	default:
		Invalidate();
	}
	*/
}

// afx_msg
BOOL CA2FormView::OnSetCursor(CWnd* pWnd, UINT nHitTest, UINT message)
{
	if (pWnd->GetSafeHwnd() != GetSafeHwnd())
		return __super::OnSetCursor(pWnd, nHitTest, message);

	CA2FormDocument* pDoc = GetDocument();
	ATLASSERT(pDoc);

	bool bLocked = false; // pDoc->IsLocked();
	if (bLocked)
		return __super::OnSetCursor(this, HTCLIENT, message);


	/*
	if (CFormTool::s_currentShape != CFormItem::_pointer)
		return __super::OnSetCursor(this, HTCLIENT, message);

	int cnt = pDoc->GetSelectionCount();
	if (cnt == 0)
		return __super::OnSetCursor(pWnd, nHitTest, message);
	*/

	/*
	CPoint pt;
	GetCursorPos(&pt);
	ScreenToClient(&pt);
	ClientToDoc(pt);
	CFormItem* pItem = GetDocument()->ObjectAt(pt);
	*/


	/*
	if (pItem && pItem->IsHLink(pt)) {
	if (GetDocument()->IsUserMode()) {
	::SetCursor(::LoadCursor(NULL, IDC_HAND));
	SetHover(pItem, pt);
	return TRUE;
	}
	}
	else {
	ClearHover();
	}
	}
	*/
	//if (IsInsideEditor()) {
	//ClearHover();
	//}

	/*
	if (cnt == 1)
	{
		CFormItem* pObj = pDoc->m_selectionList.GetHead();
		//if ((pObj->GetFlags() & VFITEM_ISLINE)) {
		//if (pObj->OnSetCursor(this))
		//return TRUE;
		//else
		//goto endOf;
		//}
		//if ((nHitTest == HTCLIENT) && (message != 0) && pObj->OnSetCursor(this))
		//return TRUE;
		CRect rect(pObj->GetPosition());
		DocToClient(rect);
		bool bNoFull = false; // pObj->GetFlags() & VFITEM_ISLINE ? true : false
		CRectTrackerEx tracker(rect, CRectTracker::resizeOutside, false);
		tracker.m_dwDrawStyle = pObj->GetTrackMask();
		if (tracker.SetCursorEx(this, nHitTest))
			return TRUE;
	}
	else
	{
		// multiply selection
		CRect rect(pDoc->GetSelectionRect());
		DocToClient(rect);
		CRectTrackerEx tracker(rect, CRectTracker::resizeOutside, true);
		tracker.m_dwDrawStyle = RTRE_MIDDLE;
		if (tracker.SetCursorEx(this, nHitTest))
			return TRUE;
	}
	*/
	return __super::OnSetCursor(pWnd, nHitTest, message);
}

// afx_msg 
BOOL CA2FormView::OnEraseBkgnd(CDC* /*pDC*/)
{
	return TRUE;
}

// virtual 
void CA2FormView::OnPrepareDC(CDC* pDC, CPrintInfo* pInfo /*= NULL*/)
{
	__super::OnPrepareDC(pDC, pInfo);
	OnPrepareDCEx(pDC, pInfo);
}

void CA2FormView::OnPrepareDCEx(CDC* pDC, CPrintInfo* pInfo /*=NULL*/)
{
	pDC->SetMapMode(MM_ANISOTROPIC);
	// Viewport = phisical
	CSize szLog(pDC->GetDeviceCaps(LOGPIXELSX), pDC->GetDeviceCaps(LOGPIXELSY));
	pDC->SetViewportExt(szLog.cx, szLog.cy);
	// Window = logical
	pDC->SetWindowExt(7200, 7200);
	pDC->OffsetViewportOrg(OFFSET_VIEWPORT_ROOT, OFFSET_VIEWPORT_ROOT); // offset viewport
																		/*
																		if ((m_zoomFactor != (UINT)IZF_100) && (pInfo == NULL)) {
																		pDC->ScaleViewportExt(GetZoomNom(m_zoomFactor), GetZoomDenom(m_zoomFactor), GetZoomNom(m_zoomFactor), GetZoomDenom(m_zoomFactor));
																		}
																		*/
}

int CA2FormView::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;
	SetScrollSizes(MM_TEXT, CSize(100, 100));
	return 0;
}

// CA2v10DesignerView drawing

void CA2FormView::OnDraw(CDC* pDC)
{
	if (IsIconic())
		return;

	CDC dc;
	CDC* pDrawDC = pDC;
	CBitmap bitmap;
	CBitmap* pOldBitmap = NULL;

	// only paint the rect that needs repainting
	CRect client;
	pDC->GetClipBox(client);

	CRect rect(client);
	pDC->LPtoDP(&rect);
	rect.InflateRect(2, 2); // avoid screen garbage (if full window drag is on)

	if (dc.CreateCompatibleDC(pDC)) {
		if (bitmap.CreateCompatibleBitmap(pDC, rect.Width(), rect.Height())) {
			OnPrepareDC(&dc, NULL);
			pDrawDC = &dc;
			dc.OffsetViewportOrg(-rect.left, -rect.top);
			pOldBitmap = dc.SelectObject(&bitmap);
			dc.SetBrushOrg(rect.left % 8, rect.top % 8);
			dc.IntersectClipRect(client);
		}
	}

	if (!pDC->IsPrinting()) {
		CBrush brush(::GetSysColor(COLOR_WINDOW));
		brush.UnrealizeObject();
		pDrawDC->FillRect(client, &brush);
	}

	if (!pDC->IsPrinting())
		DrawGrid(pDrawDC);

	/*
	RENDER_INFO ri;
	ri.pDC = pDrawDC;
	GetDocument()->DrawContent(ri);

	if (pDrawDC != pDC) {
		pDC->SetViewportOrg(0, 0);
		pDC->SetWindowOrg(0, 0);
		pDC->SetMapMode(MM_TEXT);
		dc.SetViewportOrg(0, 0);
		dc.SetWindowOrg(0, 0);
		dc.SetMapMode(MM_TEXT);
		pDC->BitBlt(rect.left, rect.top, rect.Width(), rect.Height(), &dc, 0, 0, SRCCOPY);
		dc.SelectObject(pOldBitmap);
	}
	*/
}

void CA2FormView::ClientToDoc(CRect& rect)
{
	CClientDC dc(this);
	OnPrepareDC(&dc, nullptr);
	dc.DPtoLP(rect);
	ASSERT(rect.left <= rect.right);
	ASSERT(rect.bottom >= rect.top);
}

void CA2FormView::DocToClient(CRect& rect)
{
	CClientDC dc(this);
	OnPrepareDC(&dc, nullptr);
	dc.LPtoDP(rect);
	ASSERT(rect.left <= rect.right);
	ASSERT(rect.bottom >= rect.top);
}

void CA2FormView::DocToClient(CSize& size)
{
	CClientDC dc(this);
	OnPrepareDC(&dc, nullptr);
	dc.LPtoDP(&size);
}

void CA2FormView::ClientToDoc(CPoint& point)
{
	CClientDC dc(this);
	OnPrepareDC(&dc, nullptr);
	dc.DPtoLP(&point);
}

void CA2FormView::DrawGrid(CDC* pDC)
{
}


// CA2v10DesignerView printing


void CA2FormView::OnFilePrintPreview()
{
#ifndef SHARED_HANDLERS
	//AFXPrintPreview(this);

	/*
	CPrintPreviewState *pState = new CPrintPreviewState();

	if (!DoPrintPreview(IDD_AFXBAR_RES_PRINT_PREVIEW, this, RUNTIME_CLASS(CPreviewViewEx2), pState))
	{
		TRACE0("Error: OnFilePrintPreview failed.\n");
		AfxMessageBox(AFX_IDP_COMMAND_FAILURE);
		delete pState;      // preview failed to initialize, delete State now
	}*/
#endif
}

BOOL CA2FormView::OnPreparePrinting(CPrintInfo* pInfo)
{
	// default preparation
	return DoPreparePrinting(pInfo);
}

void CA2FormView::OnBeginPrinting(CDC* /*pDC*/, CPrintInfo* /*pInfo*/)
{
	// TODO: add extra initialization before printing
}

void CA2FormView::OnEndPrinting(CDC* /*pDC*/, CPrintInfo* /*pInfo*/)
{
	// TODO: add cleanup after printing
	GetParentFrame()->SetWindowPos(NULL, 0, 0, 0, 0, SWP_NOZORDER | SWP_NOMOVE | SWP_NOSIZE | SWP_FRAMECHANGED);
}


#ifdef _DEBUG
void CA2FormView::AssertValid() const
{
	__super::AssertValid();
}

void CA2FormView::Dump(CDumpContext& dc) const
{
	__super::Dump(dc);
}

CA2FormDocument* CA2FormView::GetDocument() const // non-debug version is inline
{
	ATLASSERT(m_pDocument->IsKindOf(RUNTIME_CLASS(CA2FormDocument)));
	return reinterpret_cast<CA2FormDocument*>(m_pDocument);
}
#endif //_DEBUG

void CA2FormView::SetDocumentSize()
{
	//CRect rect(CPoint(0, 0), GetDocument()->GetPageSize());
	CRect rect(CPoint(0, 0), CSize(100 * 75, 100 * 75));// GetDocument()->GetPageSize());
	DocToClient(rect);
	rect.InflateRect(OFFSET_VIEWPORT_ROOT, OFFSET_VIEWPORT_ROOT);
	SetScrollSizes(MM_TEXT, rect.Size());
}
// virtual 
void CA2FormView::OnInitialUpdate()
{
	__super::OnInitialUpdate();
	SetDocumentSize();
}

// afx_msg
LRESULT CA2FormView::OnWmiFillToolbox(WPARAM wParam, LPARAM lParam)
{
	if (wParam != WMI_FILL_TOOLBOX_WPARAM)
		return 0L;
	UINT* nID = reinterpret_cast<UINT*>(lParam);
	*nID = IDR_TOOLBOX;
	return (LRESULT)TRUE;
}

// afx_msg
LRESULT CA2FormView::OnWmiFillProps(WPARAM wParam, LPARAM lParam)
{
	if (wParam != WMI_FILL_PROPS_WPARAM)
		return 0L;
	auto pDoc = GetDocument();
	FILL_PROPS_INFO* pInfo = reinterpret_cast<FILL_PROPS_INFO*>(lParam);
	/*
	CFormItem* pItem = pDoc->GetSelectedItem();
	if (pItem) {
		pInfo->elem = reinterpret_cast<DWORD_PTR>(pItem->GetJsHandle());
		if (pItem->GetParent())
			pInfo->parent = reinterpret_cast<DWORD_PTR>(pItem->GetParent()->GetJsHandle());
		if (pDoc->m_bPropertyChanged) {
			pDoc->m_bPropertyChanged = false;
			return (LRESULT)WMI_FILL_PROPS_RESULT_REFILL;
		}
		return (LRESULT)WMI_FILL_PROPS_RESULT_OK;
	}
	*/
	return 0L;
}

// afx_msg
void CA2FormView::OnTool(UINT nID)
{
	//CFormTool::SetShape(nID);
}

// afx_msg
void CA2FormView::OnUpdateTool(CCmdUI* pCmdUI)
{
	//pCmdUI->SetCheck(CFormTool::IsShape(pCmdUI->m_nID) ? 1 : 0);
}

// afx_msg
void CA2FormView::OnLButtonDown(UINT nFlags, CPoint point)
{
	__super::OnLButtonDown(nFlags, point);
	if (TrackOutline(point))
		return;
	/*
	CFormTool* pTool = CFormTool::FindTool();
	if (pTool == NULL)
		return;
	pTool->OnLButtonDown(this, nFlags, point);
	*/
}



bool CA2FormView::TrackOutline(CPoint point)
{
	/*
	if (!m_selection.IsEmpty() || m_bInsideEditor || GetDocument()->IsControlsLocked())
	return false;
	CRect rc(m_trackerRect);
	CPoint ptVpOrg = -GetDeviceScrollPosition();
	rc.OffsetRect(ptVpOrg);
	CClientDC dc(this);
	OnPrepareDCEx(&dc);
	CRectTrackerEx tr(rc, CRectTracker::resizeOutside, true);
	CPoint pt(MINSIZE_DLU.cx, MINSIZE_DLU.cy);
	dc.LPtoDP(&pt);

	NONCLIENTMETRICS ncm = { 0 };
	ncm.cbSize = sizeof(NONCLIENTMETRICS);
	VERIFY(SystemParametersInfo(SPI_GETNONCLIENTMETRICS, ncm.cbSize, &ncm, 0));
	pt.y += ncm.iCaptionHeight + 2;

	pt.x += 3 + ::GetSystemMetrics(SM_CXEDGE);
	pt.y += 3 + ::GetSystemMetrics(SM_CYEDGE);

	tr.m_sizeMin = CSize(pt.x, pt.y);
	UINT ht = tr.HitTest(point);
	if (ht > 0 && ht < 8) {
	if (tr.Track(this, point)) {
	// new dialog size
	CRect nr(tr.m_rect);
	nr.NormalizeRect();
	nr.bottom -= m_szDelta.cy;
	nr.right -= m_szDelta.cx;
	dc.DPtoLP(nr);
	if (nr.Width() < MINSIZE_DLU.cx)
	nr.right = nr.left + MINSIZE_DLU.cx;
	if (nr.Height() < MINSIZE_DLU.cy)
	nr.bottom = nr.top + MINSIZE_DLU.cy;
	if (GetDocument()->Size() != nr.Size()) {
	GetDocument()->SetModifiedFlag();
	GetDocument()->m_undo.DoAction(CFormUndo::_doc_size, GetDocument());
	GetDocument()->Size() = nr.Size();
	CalcOutlineRect(&dc);
	SetScrollSizes();
	Invalidate();
	}
	return true;
	}
	}
	*/
	return false;
}

// afx_msg
void CA2FormView::OnEditClear()
{
	auto pDoc = GetDocument();
	/*
	auto pItem = pDoc->GetSelectedItem();
	if (pItem) {
		pDoc->UnselectItem(pItem);
		pItem->Delete();
	}*/
	AfxMessageBox(L"Edit clear");
}

// afx_msg
void CA2FormView::OnUpdateEditClear(CCmdUI* pCmdUI)
{
	pCmdUI->Enable(TRUE);
}
