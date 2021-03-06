
// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#pragma once


class CA2EditBrowseCtrl : public CMFCEditBrowseCtrl
{
public:
	virtual void OnBrowse() override;

};

class CSolutionCreateDlg : public CDialogEx
{
public:
	CSolutionCreateDlg(CWnd* pParent = nullptr);   // standard constructor
	virtual ~CSolutionCreateDlg();

#ifdef AFX_DESIGN_TIME
	enum { IDD = IDD_SOLUTION_CREATE };
#endif

	CString m_strFolder;
	CString m_strName;
	CString m_strTemplate;

protected:
	virtual void DoDataExchange(CDataExchange* pDX) override;    // DDX/DDV support
	virtual BOOL OnInitDialog() override;

	CEdit m_name;
	CEdit m_folder;

	DECLARE_MESSAGE_MAP()

	afx_msg void OnBnClickedBrowse();
	afx_msg void OnOk();
};
