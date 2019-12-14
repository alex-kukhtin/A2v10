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


CLoginDlg::CLoginDlg(CWnd* pParent /*=nullptr*/)
	: CDialogEx(IDD_DB_LOGIN, pParent), m_bRemember(FALSE)
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
	DDX_Check(pDX, IDC_REMEMBER, m_bRemember);

	DDX_Control(pDX, IDC_AUTH, m_cmbAuth);
	DDX_Control(pDX, IDC_SERVER, m_cmbServer);
}


// virtual 
BOOL CLoginDlg::OnInitDialog() 
{
	__super::OnInitDialog();

	/*
	if (!LoadLoginInfo()) {
		m_loginInfo.FillDefault();
	}
	*/

	// TEST HERE
	m_loginInfo.FillDefault();
	SaveLoginInfo();
	LoadLoginInfo();

	CLoginServer& srv = m_loginInfo.GetCurrent();
	m_server = srv.m_name;

	LPCWSTR szDatabase = srv.GetCurrentDatabase();
	if (szDatabase)
		m_database = szDatabase;

	for (int i = 0; i < srv.m_databases.GetCount(); i++)
		m_cmbServer.AddString(srv.m_databases.ElementAt(i));

	CLoginUser* pUser = srv.GetCurrentUser();
	if (pUser) {
		m_cmbAuth.SetCurSel(pUser->m_authType);
		m_login = pUser->m_login;
		if (pUser->m_bRemember) {
			m_password = pUser->m_password;
			m_bRemember = TRUE;
		}
	}
	else {
		m_cmbAuth.SetCurSel(AUTH_WINDOWS);
	}

	//CString db = srv.m_databases.GetAt(0);

	/*
	*/
	//CLoginServer& srv = m_loginInfo.GetCurrent();
	//m_server = srv.m_name;
	//m_database = L"";
	//m_cmbAuth.SetCurSel(AUTH_WINDOWS);


	UpdateData(FALSE);
	UpdateUI();

	return TRUE;
};


// afx_msg
void CLoginDlg::OnOk()
{
	UpdateData(TRUE);

	//m_strConnectionString = L"Data Source=servername;Initial Catalog=dbnamne;Integrated Security=True";
	LPCWSTR szFormatIntegrated = L"Data Source=%s;Initial Catalog=%s;Integrated Security=True";
	LPCWSTR szFormatSql = L"Data Source=%s;Initial Catalog=%s;Integrated Security=False;";

	CString strConnectionString;
	strConnectionString.Format(szFormatIntegrated, (LPCWSTR)m_server, (LPCWSTR)m_database);

	try 
	{
		CWaitCursor wc;
		CDotNetRuntime::StartApplication(strConnectionString);

		CLoginServer& srv = m_loginInfo.GetOrCreateServer(m_server);
		srv.FindOrCreateDatabase(m_database);

		SaveLoginInfo();

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
	UpdateUI();
}

void CLoginDlg::UpdateUI()
{
	int authIndex = m_cmbAuth.GetCurSel();
	BOOL enabled = authIndex == AUTH_SQL;
	GetDlgItem(IDC_LOGIN)->EnableWindow(enabled);
	GetDlgItem(IDC_PASSWORD)->EnableWindow(enabled);
	GetDlgItem(IDC_REMEMBER)->EnableWindow(enabled);
}

bool CLoginDlg::LoadLoginInfo()
{
	try {
		WCHAR szAppDataPath[MAX_PATH];
		if (!SUCCEEDED(SHGetFolderPath(NULL, CSIDL_APPDATA, NULL, 0, szAppDataPath))) {
			AfxMessageBox(L"GetFolderPath. Internal error.");
			return false;
		}
		::PathAppend(szAppDataPath, L"A2v10//logins.dat");
		if (!::PathFileExists(szAppDataPath))
			return false;
		CFile file(szAppDataPath, CFile::modeRead);
		CArchive ar(&file, CArchive::load);
		m_loginInfo.Serialize(ar);
		ar.Close();
		file.Close();
		return true;
	}
	catch (CFileException* ex) {
		ex->ReportError();
		ex->Delete();
		return false;
	}
}

void CLoginDlg::SaveLoginInfo()
{
	try {
		WCHAR szAppDataPath[MAX_PATH];
		if (!SUCCEEDED(SHGetFolderPath(NULL, CSIDL_APPDATA, NULL, 0, szAppDataPath))) {
			AfxMessageBox(L"GetFolderPath. Internal error.");
			return;
		}
		::PathAppend(szAppDataPath, L"A2v10//");
		if (!::PathFileExists(szAppDataPath))
			CreateDirectory(szAppDataPath, nullptr);
		::PathAppend(szAppDataPath, L"logins.dat");
		CFile file(szAppDataPath, CFile::modeCreate | CFile::modeWrite);
		CArchive ar(&file, CArchive::store);
		m_loginInfo.Serialize(ar);
		ar.Close();
		file.Close();
	}
	catch (CFileException* ex) {
		ex->ReportError();
		ex->Delete();
	}
}

