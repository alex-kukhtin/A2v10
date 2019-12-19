// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#pragma once


class CVersionModules;

class CVersionDlg : public CDialogEx
{
	CVersionModules* m_pModules;
public:
	CVersionDlg(CVersionModules* pModules, CWnd* pParent = nullptr);   // standard constructor
	virtual ~CVersionDlg();

#ifdef AFX_DESIGN_TIME
	enum { IDD = IDD_DB_VERSION };
#endif

protected:

	CListCtrl m_list;


	virtual void DoDataExchange(CDataExchange* pDX) override;    // DDX/DDV support
	virtual BOOL OnInitDialog() override;

	void FillList();
	DECLARE_MESSAGE_MAP()

	afx_msg void OnRetry();
};

