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

	CString m_server;
	CString m_database;
	CString m_login;
	CString m_password;
	BOOL m_bRemember;

	CComboBox m_cmbAuth;
	CComboBox m_cmbServer;

	virtual void DoDataExchange(CDataExchange* pDX) override;    // DDX/DDV support
	virtual BOOL OnInitDialog() override;

	DECLARE_MESSAGE_MAP()

	void UpdateUI();

	bool LoadLoginInfo();
	void SaveLoginInfo();

	afx_msg void OnOk();
	afx_msg void OnAuthSelEndOk();
};
