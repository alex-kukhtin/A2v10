// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "A2v10.Application.h"
#include "logindlg.h"

CLoginDlg::CLoginDlg(CWnd* pParent /*=nullptr*/)
	: CDialogEx(IDD_DB_LOGIN, pParent)
{
}

CLoginDlg::~CLoginDlg()
{
}

BEGIN_MESSAGE_MAP(CLoginDlg, CDialogEx)
	ON_BN_CLICKED(IDOK, OnOk)
END_MESSAGE_MAP()

void CLoginDlg::DoDataExchange(CDataExchange* pDX)
{
	__super::DoDataExchange(pDX);
	DDX_Text(pDX, IDC_TEXT1, m_server);
	DDX_Text(pDX, IDC_TEXT2, m_database);
}


// virtual 
BOOL CLoginDlg::OnInitDialog() {
	__super::OnInitDialog();
	m_server = L"localhost";
	m_database = L"";
	UpdateData(FALSE);
	return TRUE;
};


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
