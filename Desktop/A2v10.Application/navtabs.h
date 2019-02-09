#pragma once


class CNavTab : public CCaptionButton
{
	CString m_caption;
	HWND m_hWnd;
	bool m_bActive;
	CRect m_closeBtnRect;
public:
	CNavTab() : m_hWnd(nullptr), m_bActive(false), m_closeBtnRect(0, 0, 0, 0) {}
	void SetHwnd(HWND hWnd) { m_hWnd = hWnd; }
	HWND GetHwnd() const { return m_hWnd; }
	void SetActive(bool bSet) { m_bActive = bSet; }
	bool SetText(const wchar_t* szCaption);

	virtual void SetRect(const CRect rect) override;
	virtual void Draw(CDC* pDC) override;
	virtual void ExecuteCommand(CWnd* pWnd, CPoint point) override;
};

class CNavTabs : public CCaptionButtonsBase
{
	CArray<CNavTab*> m_tabs;

public:
	virtual ~CNavTabs();
	virtual int GetButtonsCount() override { return m_tabs.GetCount(); }
	virtual CCaptionButton* GetButton(int index) override { return m_tabs.GetAt(index); }

	virtual void Draw(CDC* pDC) override;
	void RecalcLayout(CRect clientRect, BOOL bZoomed);
	CNavTab* GetTab(int index);
	CNavTab* FindTab(HWND hWnd);
	void AddTab(const wchar_t* szCaption, HWND hWnd, UINT nId);
	void SetActiveTab(CNavTab* pActiveTab);
	bool RemoveTab(CNavTab* pTabToRemove, CWnd* pWnd);
};
