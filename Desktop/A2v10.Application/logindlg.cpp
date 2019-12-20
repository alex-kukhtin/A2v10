// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#include "stdafx.h"
#include "A2v10.Application.h"
#include "logininfo.h"
#include "logindlg.h"
#include "checkverinfo.h"
#include "versiondlg.h"


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
	ON_CBN_SELENDOK(IDC_SERVER, OnServerSelEndOk)
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
		return TRUE;

	FillServerInfo(pSrv);

	return TRUE;
};


void CLoginDlg::FillServerInfo(CLoginServer* pSrv) 
{
	m_cmbDatabase.ResetContent();
	m_cmbUsers.ResetContent();
	SetDlgItemText(IDC_PASSWORD, EMPTYSTR);
	SetDlgItemText(IDC_LOGIN, EMPTYSTR);
	CheckDlgButton(IDC_REMEMBER, BST_UNCHECKED);

	for (int i = 0; i < pSrv->m_databases.GetCount(); i++) {
		CLoginDatabase* pDb = pSrv->m_databases.ElementAt(i);
		m_cmbDatabase.AddString(pDb->m_name);
		if (pDb->m_bSelected)
			m_cmbDatabase.SetWindowText(pDb->m_name);
	}

	m_cmbAuth.SetCurSel(AUTH_WINDOWS);
	for (int i = 0; i < pSrv->m_users.GetCount(); i++) {
		CLoginUser* pUser = pSrv->m_users.ElementAt(i);
		m_cmbUsers.AddString(pUser->GetName());
		if (pUser->m_bSelected) {
			m_cmbUsers.SetWindowText(pUser->GetName());
			m_cmbAuth.SetCurSel(pUser->GetAuth());
			if (pUser->m_bRemember) {
				SetDlgItemText(IDC_PASSWORD, pUser->m_password);
				CheckDlgButton(IDC_REMEMBER, BST_CHECKED);
			}
		}
	}
	UpdateUI();
}

// afx_msg
void CLoginDlg::OnOk()
{
	//m_strConnectionString = L"Data Source=servername;Initial Catalog=dbnamne;Integrated Security=True";
	LPCWSTR szFormatIntegrated = L"Data Source=%s;Initial Catalog=%s;Integrated Security=True";
	LPCWSTR szFormatSql = L"Data Source=%s;Initial Catalog=%s;Integrated Security=False;User Id=%s;Password=%s";


	CString strServerName(EMPTYSTR);
	CString strDbName(EMPTYSTR);
	CString strLogin(EMPTYSTR);
	CString strPassword(EMPTYSTR);
	bool bRemember = false;

	int nAuthType = m_cmbAuth.GetCurSel();

	m_cmbServer.GetWindowText(strServerName);
	m_cmbDatabase.GetWindowText(strDbName);
	m_cmbUsers.GetWindowText(strLogin);

	if (strServerName.FindOneOf(L" /,:;'&#@") != -1) {
		AfxMessageBox(IDS_ERR_INVALID_SERVER_NAME);
		return;
	}


	CString strConnectionString;
	if (nAuthType == AUTH_SQL) 
	{
		GetDlgItemText(IDC_PASSWORD, strPassword);
		bRemember = IsDlgButtonChecked(IDC_REMEMBER) ? true : false;
		strConnectionString.Format(szFormatSql, (LPCWSTR)strServerName, (LPCWSTR)strDbName, (LPCWSTR) strLogin, (LPCWSTR) strPassword);
	}
	else 
	{
		strConnectionString.Format(szFormatIntegrated, (LPCWSTR)strServerName, (LPCWSTR)strDbName);
	}

	try 
	{
		CWaitCursor wc;
		if (!bRemember)
			strPassword.Empty();
		m_loginInfo.SaveCurrentInfo(strServerName, strDbName, strLogin, strPassword, nAuthType, bRemember);
		SaveLoginInfo(m_loginInfo);
		CDotNetRuntime::StartApplication(strConnectionString);

		if (!CheckVersions())
			return;
	}
	catch (CDotNetException& de)
	{
		CString msg = de.GetMessage();
		CString outMsg;
		if (msg.Find(L"a2ui.Application.Start") != -1) {
			// procedure not found
			outMsg.FormatMessage(IDS_ERR_DB_NOT_A2V10, strDbName);
			AfxMessageBox(outMsg);
			return;
		}
		msg = msg.Mid(0, 6); // error codes
		if (msg == L"DE1001") {
			outMsg.FormatMessage(IDS_ERR_USER_NOT_FOUND, strLogin);
			AfxMessageBox(outMsg);
			return;
		} 
		de.ReportError();
		return; // not OK!
	}
	__super::OnOK();
}

bool CLoginDlg::CheckVersions()
{
	std::wstring vers = CDotNetRuntime::GetVersions();
	if (vers.empty())
		return true;
	CVersionModules modules;
	if (!modules.Parse(vers.c_str()))
		return false;
	if (modules.IsOk())
		return true;
	CVersionDlg verdlg(&modules, this);
	if (verdlg.DoModal() != IDOK)
		return false;
	return true;
}


// afx_msg
void CLoginDlg::OnServerSelEndOk()
{
	int cs = m_cmbServer.GetCurSel();
	CString strServer;
	m_cmbServer.GetLBText(cs, strServer);
	CLoginServer* pServer = m_loginInfo.FindServer(strServer, false);
	FillServerInfo(pServer);
}

// afx_msg
void CLoginDlg::OnAuthSelEndOk() 
{
	int authIndex = m_cmbAuth.GetCurSel();
	BOOL enabled = authIndex == AUTH_SQL;

	// set current user for this server
	CString serverName;
	m_cmbServer.GetWindowText(serverName);
	CLoginServer* pServer = m_loginInfo.FindServer(serverName, false);
	if (pServer) {
		CLoginUser* pUser = pServer->GetCurrentUser(authIndex);
		if (pUser) {
			if (enabled) {
				m_cmbUsers.SetWindowText(pUser->GetName());
				pServer->SelectUser(pUser);
				CheckDlgButton(IDC_REMEMBER, pUser->m_bRemember ? BST_CHECKED : BST_UNCHECKED);
				if (pUser->m_bRemember) {
					SetDlgItemText(IDC_PASSWORD, pUser->m_password);
				}
			}
			else {
				pUser->SetName(AUTH_WINDOWS, nullptr);
				pUser->m_password = EMPTYSTR;
				pUser->m_bRemember = false;
				m_cmbUsers.SetWindowText(pUser->GetName());
				SetDlgItemText(IDC_PASSWORD, EMPTYSTR);
				CheckDlgButton(IDC_REMEMBER, BST_UNCHECKED);
			}
		}
		else {
			m_cmbUsers.SetWindowText(EMPTYSTR);
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
		int cs = m_cmbUsers.GetCurSel();
		m_cmbUsers.GetLBText(cs, strLogin);
		CLoginUser* pUser = pServer->FindUser(-1, strLogin, false);
		if (pUser) {
			m_cmbAuth.SetCurSel(pUser->GetAuth());
			CheckDlgButton(IDC_REMEMBER, pUser->m_bRemember ? BST_CHECKED : BST_UNCHECKED);
			if (pUser->m_bRemember) {
				SetDlgItemText(IDC_PASSWORD, pUser->m_password);
			}
			else {
				SetDlgItemText(IDC_PASSWORD, EMPTYSTR);
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

	if (!bCreate && !::PathFileExists(szAppDataPath))
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
		if (m_loginInfo.m_servers.GetCount() == 0)
			return false;
		return true;
	}
	catch (CFileException* ex) 
	{
		ex->ReportError();
		ex->Delete();
		return false;
	}
	catch (JsonException& je) 
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

