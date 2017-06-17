// optionsps.cpp : implementation file
//

#include "stdafx.h"
#include "..\include\appdefs.h"
#include "..\include\appdata.h"
#include "..\include\appstructs.h"
#include "..\include\guiext.h"
#include "..\include\theme.h"
#include "..\include\guictrls.h"

#include "..\include\optionsps.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#define SHADOW_SIZE 2
#define TEXT_GAP    8

// CBasePropertySheet

CBasePropertySheet::CBasePropertySheet(UINT nID)
	: CMFCPropertySheet(nID, NULL, 0)
{
	SetLook(CMFCPropertySheet::PropSheetLook_List, 120);
	int cy = CTheme::GetFontHeight(CTheme::FontBig);
	// EnablePageHeader(cy + TEXT_GAP * 2);
	m_psh.dwFlags |= PSH_NOAPPLYNOW | PSH_NOCONTEXTHELP;
}

// virtual 
void CBasePropertySheet::OnDrawPageHeader(CDC* pDC, int nPage, CRect rectHeader)
{
	rectHeader.DeflateRect(0, SHADOW_SIZE, SHADOW_SIZE * 2, SHADOW_SIZE);

	pDC->FillRect(rectHeader, &afxGlobalData.brBtnFace);
	pDC->Draw3dRect(rectHeader, afxGlobalData.clrBtnShadow, afxGlobalData.clrBtnShadow);

	CDrawingManager dm(*pDC);
	dm.DrawShadow(rectHeader, SHADOW_SIZE);

	CBaseOptionPP* pPage = dynamic_cast<CBaseOptionPP*>(GetPage(nPage));
	ATLASSERT(pPage);

	CString strText;
	strText.LoadString(pPage->GetCaption());

	CRect rectText(rectHeader);
	rectText.DeflateRect(TEXT_GAP, 0);

	CThemeFontSDC font(pDC, CTheme::FontBold);
	pDC->SetBkMode(TRANSPARENT);
	pDC->SetTextColor(afxGlobalData.clrBtnText);
	pDC->DrawText(strText, rectText, DT_SINGLELINE | DT_VCENTER);
}


// COptionsPropertySheet
COptionsPropertySheet::COptionsPropertySheet()
	: CBasePropertySheet(IDS_OPTIONS_CAPTION)
{
}


class CGeneralOptionPP : public CBaseOptionPP
{
	int m_nLang; // 0-uk, 1-en, 2-ru
	CInfoMsgCtrl m_info1;
	CTitleCtrl m_title1;
public:
	CGeneralOptionPP();

protected:
	DECLARE_MESSAGE_MAP()

	virtual void DoDataExchange(CDataExchange* pDX);
	virtual BOOL OnApply();
	virtual BOOL OnInitDialog();

	afx_msg void OnLangChanged();
};

CGeneralOptionPP::CGeneralOptionPP()
	: CBaseOptionPP(IDD_OPTION_GENERAL, IDD_OPTION_GENERAL)
{
	m_nLang = (int) CAppData::GetProfileUiLang();
}

BEGIN_MESSAGE_MAP(CGeneralOptionPP, CBaseOptionPP)
	ON_CBN_SELENDOK(IDC_COMBO1, OnLangChanged)
END_MESSAGE_MAP()

// virtual 
void CGeneralOptionPP::DoDataExchange(CDataExchange* pDX)
{
	__super::DoDataExchange(pDX);
	DDX_Control(pDX, IDC_TITLE1, m_title1);
	DDX_Control(pDX, IDC_PROMPT1, m_info1);
	DDX_CBIndex(pDX, IDC_COMBO1, m_nLang);
}

// virtual 
BOOL CGeneralOptionPP::OnInitDialog()
{
	BOOL rc = __super::OnInitDialog();

	CComboBox* pBox = static_cast<CComboBox*>(GetDlgItem(IDC_COMBO1));
	ATLASSERT(pBox);
	CString strLang;
	VERIFY(strLang.LoadString(IDS_LANGUAGES));
	CString strRes;
	for (int i = 0; true; i++) 
	{
		if (!AfxExtractSubString(strRes, strLang, i, L';'))
			break;
		pBox->AddString(strRes);
	}

	// current - not profile!
	int nCLang = CAppData::GetCurrentUILang(); 

	UpdateData(FALSE); // set nCLang
	if (nCLang != m_nLang)
		m_info1.ShowWindow(SW_SHOW);
	return rc;
}

void CGeneralOptionPP::OnLangChanged()
{
	if (m_info1.IsWindowVisible())
		return;
	CWnd* pWnd = GetDlgItem(IDC_COMBO1);
	ATLASSERT(pWnd);
	int iIndex = static_cast<CComboBox*>(pWnd)->GetCurSel();
	if (iIndex != m_nLang)
		m_info1.ShowWindow(SW_SHOW);
}

// virtual 
BOOL CGeneralOptionPP::OnApply()
{
	UpdateData(TRUE);

	CAppData::SetProfileUiLang(m_nLang);

	return __super::OnApply();
}

// static 
void COptionsPropertySheet::DoOptions(DWORD dwPages /*= COptionsPropertySheet::page_all*/)
{
	COptionsPropertySheet sheet;

	CGeneralOptionPP gp;

	int x = 0;
	if (dwPages & COptionsPropertySheet::page_general) {
		sheet.AddPage(&gp);
		x++;
	}
	ATLASSERT(x > 0);
	if (x == 0)
		return;
	sheet.DoModal();
}
