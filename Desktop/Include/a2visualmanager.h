#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA


class CA2VisualManager : public CMFCVisualManagerVS2005
{
	DECLARE_DYNCREATE(CA2VisualManager)

	COLORREF m_clrMenuSideBar;
	COLORREF m_clrToolBar;
	COLORREF m_clrDivider;
	COLORREF m_clrStatusBar;
	COLORREF m_clrStatusBarDebugMode;
	COLORREF m_clrCaptionButtonBackground;
	COLORREF m_clrActiveCaption;
	COLORREF m_clrInactiveCaption;
	COLORREF m_clrWindowCaption;
	COLORREF m_clrDockedPaneBorder;
	COLORREF m_clrTabArea;
	COLORREF m_clrHotTab;
	COLORREF m_clrMainClientArea;
	COLORREF m_clrTabViewArea;
	COLORREF m_clrTabViewBorder;

	COLORREF m_clrHeaderBack;
	COLORREF m_clrHeaderBorder;

	CBrush m_brMenuSideBar;
	CBrush m_brToolBar;
	CBrush m_brDivider;
	CBrush m_brStatusBar;
	CBrush m_brStatusBarDebugMode;
	CBrush m_brActiveCaption;
	CBrush m_brInactiveCaption;
	CBrush m_brWindowCaption;
	CBrush m_brDockedPaneBorder;
	CBrush m_brTabArea;
	CBrush m_brHotTab;
	CBrush m_brMainClientArea;
	CBrush m_brTabViewArea;
	CBrush m_brTabViewBorder;
	CBrush m_brHeaderBack;

	bool m_bDebugMode;
public:
	CA2VisualManager();
	virtual ~CA2VisualManager();

public:
	bool SetDebugMode(bool bMode);

	CBrush* GetDockedPaneBorderBrush() { return &m_brDockedPaneBorder; }
	CBrush* GetWindowCaptionBackgroundBrush() { return &m_brWindowCaption; }
	void OnDrawA2CaptionButton(CDC* pDC, CRect rect, UINT nID, bool bHighlighted, bool bPressed);

	virtual int GetDockingTabsBordersSize() { return 0; }
	virtual void OnDrawMiniFrameBorder(CDC* pDC, CPaneFrameWnd* pFrameWnd, CRect rectBorder, CRect rectBorderSize);

	virtual int GetDockingPaneCaptionExtraHeight() const { return 2; } /*for docking*/
	virtual CSize GetCaptionButtonExtraBorder() const { return CSize(0, 3); } /*for floating*/

	virtual int GetMenuImageMargin() const { return 3; }

	virtual void OnUpdateSystemColors();
	virtual void OnDrawPaneBorder(CDC* pDC, CBasePane* pBar, CRect& rect);
	virtual void OnDrawPaneDivider(CDC* pDC, CPaneDivider* pSlider, CRect rect, BOOL bAutoHideMode);
	virtual void OnFillBarBackground(CDC* pDC, CBasePane* pBar, CRect rectClient, CRect rectClip, BOOL bNCArea = FALSE);
	virtual COLORREF OnDrawPaneCaption(CDC* pDC, CDockablePane* pBar, BOOL bActive, CRect rectCaption, CRect rectButtons);
	virtual COLORREF OnFillMiniFrameCaption(CDC* pDC, CRect rectCaption, CPaneFrameWnd* pFrameWnd, BOOL bActive);
	virtual void OnDrawCaptionButton(CDC* pDC, CMFCCaptionButton* pButton, BOOL bActive, BOOL bHorz, BOOL bMaximized, BOOL bDisabled, int nImageID = -1);
	virtual void OnDrawTabContent(CDC* pDC, CRect rectTab, int iTab, BOOL bIsActive, const CMFCBaseTabCtrl* pTabWnd, COLORREF clrText);

	virtual BOOL AlwaysHighlight3DTabs() const { return TRUE; }
	virtual BOOL IsHighlightOneNoteTabs() const { return TRUE; }
	virtual BOOL IsDockingTabHasBorder() { return FALSE; }
	virtual void OnEraseTabsArea(CDC* pDC, CRect rect, const CMFCBaseTabCtrl* pTabWnd);
	virtual BOOL OnEraseTabsFrame(CDC* pDC, CRect rect, const CMFCBaseTabCtrl* pTabWnd);
	virtual void OnDrawTab(CDC* pDC, CRect rectTab, int iTab, BOOL bIsActive, const CMFCBaseTabCtrl* pTabWnd);
	virtual void GetTabFrameColors(const CMFCBaseTabCtrl* pTabWnd, COLORREF& clrDark, COLORREF& clrBlack,
		COLORREF& clrHighlight, COLORREF& clrFace, COLORREF& clrDarkShadow, COLORREF& clrLight, CBrush*& pbrFace, CBrush*& pbrBlack);
	virtual int GetMDITabsBordersSize() { return 1; /* Default */ }
	virtual void OnDrawTabCloseButton(CDC* pDC, CRect rect, const CMFCBaseTabCtrl* pTabWnd, BOOL bIsHighlighted, BOOL bIsPressed, BOOL bIsDisabled);
	virtual void OnEraseTabsButton(CDC* pDC, CRect rect, CMFCButton* pButton, CMFCBaseTabCtrl* pWndTab);

	virtual BOOL OnEraseMDIClientArea(CDC* pDC, CRect rectClient);
	virtual void OnDrawSeparator(CDC* pDC, CBasePane* pBar, CRect rect, BOOL bHorz);

	virtual BOOL HasOverlappedAutoHideButtons() const { return FALSE; }

	virtual void OnFillAutoHideButtonBackground(CDC* pDC, CRect rect, CMFCAutoHideButton* pButton);
	virtual void OnDrawAutoHideButtonBorder(CDC* pDC, CRect rectBounds, CRect rectBorderSize, CMFCAutoHideButton* pButton);
	virtual COLORREF GetAutoHideButtonTextColor(CMFCAutoHideButton* pButton) override;
	virtual void OnFillButtonInterior(CDC* pDC, CMFCToolBarButton* pButton, CRect rect, CMFCVisualManager::AFX_BUTTON_STATE state) override;
	virtual COLORREF GetToolbarButtonTextColor(CMFCToolBarButton* pButton, CMFCVisualManager::AFX_BUTTON_STATE state) override;
	virtual void OnDrawButtonBorder(CDC* pDC, CMFCToolBarButton* pButton, CRect rect, CMFCVisualManager::AFX_BUTTON_STATE state) override;
	virtual void OnHighlightMenuItem(CDC* pDC, CMFCToolBarMenuButton* pButton, CRect rect, COLORREF& clrText) override;
	virtual void OnDrawComboDropButton(CDC* pDC, CRect rect, BOOL bDisabled, BOOL bIsDropped, BOOL bIsHighlighted, CMFCToolBarComboBoxButton* pButton) override;
	virtual void OnDrawComboBorder(CDC* pDC, CRect rect, BOOL bDisabled, BOOL bIsDropped, BOOL bIsHighlighted, CMFCToolBarComboBoxButton* pButton) override;
	virtual COLORREF OnDrawPropertySheetListItem(CDC* pDC, CMFCPropertySheet* pParent, CRect rect, BOOL bIsHighlihted, BOOL bIsSelected) override;
	virtual COLORREF OnDrawRibbonStatusBarPane(CDC* pDC, CMFCRibbonStatusBar* pBar, CMFCRibbonStatusBarPane* pPane) override;

	virtual COLORREF GetRibbonHyperlinkTextColor(CMFCRibbonLinkCtrl* pHyperLink);
	virtual COLORREF GetRibbonStatusBarTextColor(CMFCRibbonStatusBar* pStatusBar);

	virtual void OnDrawHeaderCtrlBorder(CMFCHeaderCtrl* pCtrl, CDC* pDC, CRect& rect, BOOL bIsPressed, BOOL bIsHighlighted);
	virtual void OnFillHeaderCtrlBackground(CMFCHeaderCtrl* pCtrl, CDC* pDC, CRect rect);
	virtual void OnDrawHeaderCtrlSortArrow(CMFCHeaderCtrl* pCtrl, CDC* pDC, CRect& rect, BOOL bIsUp);

protected:
	void OnDrawCaptionButtonXP(CDC* pDC, CMFCCaptionButton* pButton, BOOL bActive, BOOL bHorz, BOOL bMaximized, BOOL bDisabled, int nImageID = -1);
	BOOL IsNotActiveMdiGroup(const CMFCBaseTabCtrl* pTabWnd);
	void OnDrawTabContentMDI(CDC* pDC, CRect rectTab, int iTab, BOOL bIsActive, const CMFCBaseTabCtrl* pTabWnd, COLORREF clrText);
	void OnDrawTabView(CDC* pDC, CRect rectTab, int iTab, BOOL bIsActive, const CMFCBaseTabCtrl* pTabWnd);
};


#undef AFX_DATA
#define AFX_DATA

