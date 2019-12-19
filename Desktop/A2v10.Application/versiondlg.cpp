// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "A2v10.Application.h"
#include "checkverinfo.h"
#include "versiondlg.h"


#define IMAGE_OK		4
#define IMAGE_INVALID	1

CVersionDlg::CVersionDlg(CVersionModules* pModules, CWnd* pParent /*=nullptr*/)
	: CDialogEx(IDD_DB_VERSION, pParent), m_pModules(pModules)
{
}


CVersionDlg::~CVersionDlg()
{
}

BEGIN_MESSAGE_MAP(CVersionDlg, CDialogEx)
	ON_BN_CLICKED(IDRETRY, OnRetry)
END_MESSAGE_MAP()

void CVersionDlg::DoDataExchange(CDataExchange* pDX)
{
	__super::DoDataExchange(pDX);
	DDX_Control(pDX, IDC_LIST1, m_list);

}


// virtual 
BOOL CVersionDlg::OnInitDialog()
{
	__super::OnInitDialog();

	m_list.InsertColumn(0, L"Модуль", LVCFMT_LEFT, 200);
	m_list.InsertColumn(1, L"Встановлено", LVCFMT_CENTER, 105);
	m_list.InsertColumn(2, L"Потрібно", LVCFMT_CENTER, 105);
	m_list.SetExtendedStyle(LVS_EX_FULLROWSELECT);

	m_list.SetImageList(CTheme::GetImageList(), LVSIL_SMALL);


	FillList();

	return TRUE;
};


void CVersionDlg::FillList()
{
	m_list.DeleteAllItems();
	for (int i = 0; i < m_pModules->GetSize(); i++) {
		CVersionModule* pModule = m_pModules->GetAt(i);
		int iItem = m_list.InsertItem(i, pModule->m_module, pModule->IsVersionOk() ? IMAGE_OK : IMAGE_INVALID);
		m_list.SetItemText(iItem, 1, pModule->InstalledVersion());
		m_list.SetItemText(iItem, 2, pModule->RequiredVersion());
	}
}


// afx_msg 
void CVersionDlg::OnRetry() {
	// TODO: fill always
	std::wstring vers = CDotNetRuntime::GetVersions();
	m_pModules->Clear();;
	if (!m_pModules->Parse(vers.c_str()))
		return;
	FillList();
}