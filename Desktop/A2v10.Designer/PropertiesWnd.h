
#pragma once


class CA2PropertyGridProperty : public CMFCPropertyGridProperty
{
public:
	CA2PropertyGridProperty(const CString& strGroupName, DWORD_PTR dwData = 0, BOOL bIsValueList = FALSE)
		: CMFCPropertyGridProperty(strGroupName, dwData, bIsValueList), m_bAttached(false) {}

	CA2PropertyGridProperty(const CString& strName, const COleVariant& varValue, LPCTSTR lpszDescr = NULL, DWORD_PTR dwData = 0,
		LPCTSTR lpszEditMask = NULL, LPCTSTR lpszEditTemplate = NULL, LPCTSTR lpszValidChars = NULL)
		: CMFCPropertyGridProperty(strName, varValue, lpszDescr, dwData, lpszEditMask, lpszEditTemplate, lpszValidChars),
		m_bAttached(false) {}

	virtual CString FormatProperty();
	BOOL AddSubItemSorted(CMFCPropertyGridProperty* pProp);

	bool m_bAttached;
};

class CA2PropertyGridCtrl : public CMFCPropertyGridCtrl
{
public:
	//JavaScriptValue m_jsValue;
	//JavaScriptValue m_jsValueParent;
	virtual void OnPropertyChanged(CMFCPropertyGridProperty* pProp) const;

	void FillProperties(JavaScriptValue val, JavaScriptValue parent);
	void FillPropertyValues();

protected:
	virtual void OnDrawDescription(CDC* pDC, CRect rect);
	//CMFCPropertyGridProperty* GetPropertyValue(LPCWSTR szName, JavaScriptValue& meta, bool bAttached);
	void FillPropertiesInt();
};

class CPropertiesWnd : public CA2DockablePane
{
	// Construction
public:
	CPropertiesWnd();

	void AdjustLayout();

	// Attributes
public:
	void SetVSDotNetLook(BOOL bSet)
	{
		m_wndPropList.SetVSDotNetLook(bSet);
		m_wndPropList.SetGroupNameFullWidth(bSet);
	}

protected:
	CComboBox m_wndObjectCombo;
	CA2MFCToolBar m_wndToolBar;
	CA2PropertyGridCtrl m_wndPropList;

	virtual void OnUpdateCmdUI(CFrameWnd* pTarget, BOOL bDisableIfNoHndler);

	// Implementation
public:
	virtual ~CPropertiesWnd();

protected:
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnSize(UINT nType, int cx, int cy);
	afx_msg void OnSetFocus(CWnd* pOldWnd);
	afx_msg void OnExpandAllProperties();
	afx_msg void OnUpdateExpandAllProperties(CCmdUI* pCmdUI);
	afx_msg void OnProperties1();
	afx_msg void OnUpdateProperties1(CCmdUI* pCmdUI);
	afx_msg LRESULT OnWmiSettingChange(WPARAM wParam, LPARAM lParam);

	afx_msg void OnAlphabetical();
	afx_msg void OnUpdateAlphabetical(CCmdUI* pCmdUI);
	afx_msg void OnCategorized();
	afx_msg void OnUpdateCategorized(CCmdUI* pCmdUI);

	DECLARE_MESSAGE_MAP()

	void InitPropList();
	void SetPropListFont();

	int m_nComboHeight;
};

