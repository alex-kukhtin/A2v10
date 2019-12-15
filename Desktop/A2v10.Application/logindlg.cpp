// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "A2v10.Application.h"
#include "logininfo.h"
#include "logindlg.h"


#define IDC_AUTH		IDC_COMBO1
#define IDC_SERVER		IDC_TEXT1
#define IDC_DATABASE	IDC_TEXT2
#define IDC_LOGIN		IDC_TEXT3
#define IDC_PASSWORD	IDC_TEXT4 
#define IDC_REMEMBER	IDC_CHECK1


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
	ON_CBN_SELENDOK(IDC_LOGIN, OnLoginSelEndOk)
END_MESSAGE_MAP()

void CLoginDlg::DoDataExchange(CDataExchange* pDX)
{
	__super::DoDataExchange(pDX);
	
	DDX_Control(pDX, IDC_AUTH, m_cmbAuth);
	DDX_Control(pDX, IDC_LOGIN, m_cmbUsers);
	DDX_Control(pDX, IDC_SERVER, m_cmbServer);
	DDX_Control(pDX, IDC_DATABASE, m_cmbDatabase);
}


// virtual 
BOOL CLoginDlg::OnInitDialog() 
{
	__super::OnInitDialog();

	if (!LoadLoginInfo()) {
		m_loginInfo.FillDefault();
	}

	CLoginServer* pSrv = nullptr;
	for (int i = 0; i < m_loginInfo.m_servers.GetCount(); i++) {
		CLoginServer* piSrv1 = m_loginInfo.m_servers.GetAt(i);
		m_cmbServer.AddString(piSrv1->m_name);
		if (piSrv1->m_bSelected) {
			m_cmbServer.SetWindowText(piSrv1->m_name);
			pSrv = piSrv1;
		}
	}

	if (pSrv == nullptr)
		return true;

	for (int i = 0; i < pSrv->m_databases.GetCount(); i++) {
		CLoginDatabase* pDb = pSrv->m_databases.ElementAt(i);
		m_cmbDatabase.AddString(pDb->m_name);
		if (pDb->m_bSelected)
			m_cmbDatabase.SetWindowText(pDb->m_name);
	}

	m_cmbAuth.SetCurSel(AUTH_WINDOWS);
	for (int i = 0; i < pSrv->m_users.GetCount(); i++) {
		CLoginUser* pUser = pSrv->m_users.ElementAt(i);
		m_cmbUsers.AddString(pUser->m_login);
		if (pUser->m_bSelected) {
			m_cmbUsers.SetWindowText(pUser->m_login);
			m_cmbAuth.SetCurSel(pUser->m_authType);
			if (pUser->m_bRemember) {
				SetDlgItemText(IDC_PASSWORD, pUser->m_password);
				CheckDlgButton(IDC_REMEMBER, BST_CHECKED);
			}
		}
	}

	UpdateUI();

	return TRUE;
};


// afx_msg
void CLoginDlg::OnOk()
{
	//m_strConnectionString = L"Data Source=servername;Initial Catalog=dbnamne;Integrated Security=True";
	LPCWSTR szFormatIntegrated = L"Data Source=%s;Initial Catalog=%s;Integrated Security=True";
	LPCWSTR szFormatSql = L"Data Source=%s;Initial Catalog=%s;Integrated Security=False;";


	CString strServerName(EMPTYSTR);
	CString strDbName(EMPTYSTR);
	CString strLogin(EMPTYSTR);
	CString strPassword(EMPTYSTR);
	bool bRemember = false;

	int nAuthType = m_cmbAuth.GetCurSel();

	m_cmbServer.GetWindowText(strServerName);
	m_cmbDatabase.GetWindowText(strDbName);

	if (nAuthType == AUTH_SQL) {
		m_cmbUsers.GetWindowText(strLogin);
		bRemember = IsDlgButtonChecked(IDC_REMEMBER) ? true : false;
		if (bRemember)
			GetDlgItemText(IDC_PASSWORD, strPassword);
	}

	CString strConnectionString;
	strConnectionString.Format(szFormatIntegrated, (LPCWSTR)strServerName, (LPCWSTR)strDbName);

	try 
	{
		CWaitCursor wc;
		//CDotNetRuntime::StartApplication(strConnectionString);
		m_loginInfo.SaveCurrentInfo(strServerName, strDbName, strLogin, strPassword, nAuthType, bRemember);

		/*
		m_loginInfo.SetInfo(serverName, dbName);
		CLoginServer& srv = m_loginInfo.GetOrCreateServer(m_server);
		srv.FindOrCreateDatabase(dbName);
		*/
		SaveLoginInfo(m_loginInfo);

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
	int authIndex = m_cmbAuth.GetCurSel();
	BOOL enabled = authIndex == AUTH_SQL;

	if (enabled) {
		// set current user for this server
		CString serverName;
		m_cmbServer.GetWindowText(serverName);
		CLoginServer* pServer = m_loginInfo.FindServer(serverName, false);
		if (pServer) {
			CLoginUser* pUser = pServer->GetCurrentUser();
			if (pUser) {
				m_cmbUsers.SetWindowText(pUser->m_login);
				CheckDlgButton(IDC_REMEMBER, pUser->m_bRemember ? BST_CHECKED : BST_UNCHECKED);
				if (pUser->m_bRemember) {
					SetDlgItemText(IDC_PASSWORD, pUser->m_password);
				}
			}
		}
	}

	UpdateUI();
}

// afx_msg 
void CLoginDlg::OnLoginSelEndOk()
{
	CString serverName;
	m_cmbServer.GetWindowText(serverName);
	CLoginServer* pServer = m_loginInfo.FindServer(serverName, false);
	if (pServer) {
		CString strLogin;
		m_cmbUsers.GetWindowText(strLogin);
		CLoginUser* pUser = pServer->FindUser(strLogin, false);
		if (pUser) {
			m_cmbAuth.SetCurSel(pUser->m_authType);
			CheckDlgButton(IDC_REMEMBER, pUser->m_bRemember ? BST_CHECKED : BST_UNCHECKED);
			if (pUser->m_bRemember) {
				SetDlgItemText(IDC_PASSWORD, pUser->m_password);
			}
		}
	}
	UpdateUI();
}

void CLoginDlg::UpdateUI()
{
	int authIndex = m_cmbAuth.GetCurSel();
	BOOL enabled = authIndex == AUTH_SQL;
	m_cmbUsers.EnableWindow(enabled);
	GetDlgItem(IDC_PASSWORD)->EnableWindow(enabled);
	GetDlgItem(IDC_REMEMBER)->EnableWindow(enabled);
	if (!enabled) {
		m_cmbUsers.SetWindowTextW(EMPTYSTR);
		CheckDlgButton(IDC_REMEMBER, BST_UNCHECKED);
		SetDlgItemText(IDC_PASSWORD, EMPTYSTR);
	}
}

CString CLoginDlg::GetLoginsPath(bool bCreate)
{
	WCHAR szAppDataPath[MAX_PATH];
	if (!SUCCEEDED(SHGetFolderPath(NULL, CSIDL_APPDATA, NULL, 0, szAppDataPath))) {
		AfxMessageBox(L"GetFolderPath. Internal error.");
		return EMPTYSTR;
	}
	::PathAppend(szAppDataPath, L"A2v10//");
	if (bCreate && !::PathFileExists(szAppDataPath))
		CreateDirectory(szAppDataPath, nullptr);

	::PathAppend(szAppDataPath, L"logins.json");
	if (!::PathFileExists(szAppDataPath))
		return EMPTYSTR;

	return szAppDataPath;
}

bool CLoginDlg::LoadLoginInfo()
{
	try 
	{

		CString appDataPath = GetLoginsPath(false);
		if (appDataPath.IsEmpty())
			return false;

		CString json;
		CFileTools::LoadFile(appDataPath, json);

		JsonParser prs;
		prs.SetTarget(&m_loginInfo);
		prs.Parse(json);
		return true;
	}
	catch (CFileException* ex) 
	{
		ex->ReportError();
		ex->Delete();
		return false;
	}
	catch (JsonException je) 
	{
		AfxMessageBox(je.GetMessage());
		return false;
	}
}

void CLoginDlg::SaveLoginInfo(CLoginInfo& info)
{
	try {
		CString appDataPath = GetLoginsPath(true);
		if (appDataPath.IsEmpty())
			return;
		CString json;
		info.Serialize(json);
		CFileTools::SaveFileUTF8(appDataPath, json);
	}
	catch (CFileException* ex) 
	{
		ex->ReportError();
		ex->Delete();
	}
}

