// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#pragma once


class CLoginDlg : public CDialogEx
{
public:
	CLoginDlg(CWnd* pParent = nullptr);   // standard constructor
	virtual ~CLoginDlg();

#ifdef AFX_DESIGN_TIME
	enum { IDD = IDD_DB_LOGIN };
#endif

protected:

	CLoginInfo m_loginInfo;

	CComboBox m_cmbAuth;
	CComboBox m_cmbServer;
	CComboBox m_cmbDatabase;
	CComboBox m_cmbUsers;

	virtual void DoDataExchange(CDataExchange* pDX) override;    // DDX/DDV support
	virtual BOOL OnInitDialog() override;

	DECLARE_MESSAGE_MAP()

	CString GetLoginsPath(bool bCreate);
	void UpdateUI();

	bool LoadLoginInfo();
	void SaveLoginInfo(CLoginInfo& info);
	void FillServerInfo(CLoginServer* pServer);
	bool CheckVersions();

	afx_msg void OnOk();
	afx_msg void OnServerSelEndOk();
	afx_msg void OnAuthSelEndOk();
	afx_msg void OnLoginSelEndOk();
};
