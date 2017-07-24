
// ChildFrm.cpp : implementation of the CChildFrame class
//

#include "stdafx.h"
#include "A2v10.Designer.h"

#include "ChildFrm.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

// CChildFrame

IMPLEMENT_DYNCREATE(CChildFrame, CMDIChildWndEx)

BEGIN_MESSAGE_MAP(CChildFrame, CMDIChildWndEx)
	ON_WM_CREATE()
	ON_WM_CLOSE()
END_MESSAGE_MAP()

// CChildFrame construction/destruction

CChildFrame::CChildFrame()
{
	// TODO: add member initialization code here
}

CChildFrame::~CChildFrame()
{
}

BOOL CChildFrame::OnCreateClient(LPCREATESTRUCT lpcs, CCreateContext* pContext)
{
	return __super::OnCreateClient(lpcs, pContext);
	/*
	BOOL rc = m_wndSplitter.Create(this,
	2, 2,			// TODO: adjust the number of rows, columns
	CSize(10, 10),	// TODO: adjust the minimum pane size
	pContext);
	m_wndSplitter.ModifyStyleEx(WS_EX_CLIENTEDGE, 0);
	return rc;
	*/
}

BOOL CChildFrame::PreCreateWindow(CREATESTRUCT& cs)
{
	// TODO: Modify the Window class or styles here by modifying the CREATESTRUCT cs
	if (!__super::PreCreateWindow(cs))
		return FALSE;
	cs.style |= WS_MAXIMIZE;
	return TRUE;
}

// afx_msg
int CChildFrame::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;
	ModifyStyleEx(WS_EX_CLIENTEDGE, 0, 0);
	ModifyStyle(0, WS_MAXIMIZE);
	AfxGetMainWnd()->PostMessage(WMI_IDLE_UPDATE, WMI_IDLE_UPDATE_WPARAM, IDLE_UPDATE_MDITABS);
	return 0;
}

// afx_msg
void CChildFrame::OnClose()
{
	AfxGetMainWnd()->PostMessage(WMI_IDLE_UPDATE, WMI_IDLE_UPDATE_WPARAM, IDLE_UPDATE_MDITABS);
	__super::OnClose();
}

// CChildFrame diagnostics

#ifdef _DEBUG
void CChildFrame::AssertValid() const
{
	__super::AssertValid();
}

void CChildFrame::Dump(CDumpContext& dc) const
{
	__super::Dump(dc);
}
#endif //_DEBUG

BOOL CChildFrame::IsOwnerDrawCaption2() 
{ 
	return CMFCVisualManager::GetInstance()->IsOwnerDrawCaption(); // && !m_bIsOleInPlaceActive;
}

void CChildFrame::OnUpdateFrameTitle2(BOOL bAddToTitle)
{
	// from CMDIChildWnd::OnUpdateFrameTitle
	// update our parent window first
	GetMDIFrame()->OnUpdateFrameTitle(bAddToTitle);

	if ((GetStyle() & FWS_ADDTOTITLE) == 0)
		return;     // leave child window alone!

	CDocument* pDocument = GetActiveDocument();
	if (bAddToTitle)
	{
		TCHAR szText[256 + _MAX_PATH];
		if (pDocument == NULL)
			Checked::tcsncpy_s(szText, _countof(szText), m_strTitle, _TRUNCATE);
		else {
			Checked::tcsncpy_s(szText, _countof(szText), pDocument->GetTitle(), _TRUNCATE);
		}
		if (m_nWindow > 0)
		{
			TCHAR szWinNumber[16 + 1];
			_stprintf_s(szWinNumber, _countof(szWinNumber), _T(":%d"), m_nWindow);

			if (_tcslen(szText) + _tcslen(szWinNumber) < _countof(szText))
			{
				Checked::tcscat_s(szText, _countof(szText), szWinNumber);
			}
		}

		if (pDocument->IsModified())
			Checked::tcscat_s(szText, _countof(szText), L"*");
		// set title if changed, but don't remove completely
		AfxSetWindowText(m_hWnd, szText);
	}
}

// virtual 
void CChildFrame::OnUpdateFrameTitle(BOOL bAddToTitle)
{
	// from CMDIChildWndEx::OnUpdateFrameTitle
	BOOL bRedraw = /*m_Impl.IsOwnerDrawCaption()*/  IsOwnerDrawCaption2() && IsWindowVisible() && (GetStyle() & WS_MAXIMIZE) == 0;

	CString strTitle1;

	if (bRedraw)
	{
		GetWindowText(strTitle1);
	}

	//CMDIChildWnd::OnUpdateFrameTitle(bAddToTitle);
	OnUpdateFrameTitle2(bAddToTitle);

	if (bRedraw)
	{
		CString strTitle2;
		GetWindowText(strTitle2);

		if (strTitle1 != strTitle2)
		{
			SendMessage(WM_NCPAINT, 0, 0);
		}
	}

	if (m_pMDIFrame != NULL)
	{
		ASSERT_VALID(m_pMDIFrame);
		//m_pMDIFrame->m_wndClientArea.UpdateTabs();
		CA2MDIFrameWnd* pFrame = DYNAMIC_DOWNCAST(CA2MDIFrameWnd, m_pMDIFrame);
		ATLASSERT(pFrame);
		pFrame->UpdateTabs();
	}
}

// CChildFrame message handlers
