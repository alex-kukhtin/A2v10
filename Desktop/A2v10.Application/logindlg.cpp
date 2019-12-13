// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "A2v10.Application.h"
#include "logininfo.h"
#include "logindlg.h"


#define IDC_AUTH		IDC_COMBO1
#define IDC_SERVER		IDC_TEXT1
#define IDC_LOGIN		IDC_TEXT3
#define IDC_PASSWORD	IDC_TEXT4 
#define IDC_REMEMBER	IDC_CHECK1

#define AUTH_WINDOWS 0
#define AUTH_SQL 1

CLoginDlg::CLoginDlg(CWnd* pParent /*=nullptr*/)
	: CDialogEx(IDD_DB_LOGIN, pParent)
{
}


CLoginDlg::~CLoginDlg()
{
}

BEGIN_MESSAGE_MAP(CLoginDlg, CDialogEx)
	ON_BN_CLICKED(IDOK, OnOk)
	ON_CBN_SELENDOK(IDC_AUTH, OnAuthSelEndOk)
END_MESSAGE_MAP()

void CLoginDlg::DoDataExchange(CDataExchange* pDX)
{
	__super::DoDataExchange(pDX);
	DDX_Text(pDX, IDC_SERVER, m_server);
	DDX_Text(pDX, IDC_TEXT2, m_database);
	DDX_Text(pDX, IDC_LOGIN, m_login);
	DDX_Text(pDX, IDC_PASSWORD, m_password);
	DDX_Control(pDX, IDC_AUTH, m_cmbAuth);
	DDX_Control(pDX, IDC_SERVER, m_cmbServer);
}


// virtual 
BOOL CLoginDlg::OnInitDialog() {
	__super::OnInitDialog();
	m_server = L"localhost";
	m_cmbServer.AddString(L"1111");
	m_cmbServer.AddString(L"2222");
	m_cmbServer.AddString(L"3333");
	m_database = L"";
	m_cmbAuth.SetCurSel(AUTH_WINDOWS);
	UpdateData(FALSE);
	UpdateUI();
	return TRUE;
};


// afx_msg
void CLoginDlg::OnOk()
{
	UpdateData(TRUE);
	//m_strConnectionString = L"Data Source=servername;Initial Catalog=dbnamne;Integrated Security=True";
	LPCWSTR szFormat = L"Data Source=%s;Initial Catalog=%s;Integrated Security=True";
	CString strConnectionString;
	strConnectionString.Format(szFormat, (LPCWSTR)m_server, (LPCWSTR)m_database);

	try 
	{
		CWaitCursor wc;
		CDotNetRuntime::StartApplication(strConnectionString);
	}
	catch (CDotNetException& de)
	{
		de.ReportError();
		return;
	}
	__super::OnOK();
}


// afx_msg
void CLoginDlg::OnAuthSelEndOk() 
{
	m_authIndex = m_cmbAuth.GetCurSel();
	UpdateUI();
}

void CLoginDlg::UpdateUI()
{
	BOOL enabled = m_authIndex == AUTH_SQL;
	GetDlgItem(IDC_LOGIN)->EnableWindow(enabled);
	GetDlgItem(IDC_PASSWORD)->EnableWindow(enabled);
	GetDlgItem(IDC_REMEMBER)->EnableWindow(enabled);
}

