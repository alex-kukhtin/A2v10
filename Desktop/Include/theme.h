// Copyright © 2008-2017 Alex Kukhtin. All rights reserved.

#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CTheme
{
public:
	enum FontType {
		FontNone = -1,
		FontNormal = 0,
		FontBold = 1,
		FontUnderline = 2,
		FontBoldUnderline = 3,
		FontBig = 4,
		FontBigBold = 5,
		FontSmall = 6,
		FontItalic = 7,
		FontWebdings = 8,
		FontNonClient = 9,
		FontUiDefault = 10,
		//----------------
		FontTypeLast = 10,
		FontTypeCount = FontTypeLast + 1,
	};

	enum ImageListType{
		ImageList16x16 = 0,
		ImageList10x10 = 1,
		ImageList12x12 = 2,
		//----------------
		ImageListLast = 2,
		ImageListCount = ImageListLast + 1,
	};


	enum ColorType
	{
		ColorSystemFirst = 0,
		ColorScrollbar = COLOR_SCROLLBAR,			// 0
		ColorBackground = COLOR_BACKGROUND,			// 1
		ColorActiveCaption = COLOR_ACTIVECAPTION,   // 2
		ColorInactiveCaption = COLOR_INACTIVECAPTION, // 3
		ColorMenu = COLOR_MENU,						// 4
		ColorWindow = COLOR_WINDOW,					// 5
		ColorWindowFrame = COLOR_WINDOWFRAME,		// 6
		ColorMenuText = COLOR_MENUTEXT,				// 7
		ColorWindowText = COLOR_WINDOWTEXT,			// 8
		ColorCaptionText = COLOR_CAPTIONTEXT,		// 9
		ColorActiveBorder = COLOR_ACTIVEBORDER,		// 10
		ColorInactiveBorder = COLOR_INACTIVEBORDER, // 11
		ColorAppWorkspace = COLOR_APPWORKSPACE,		// 12
		ColorHighlight = COLOR_HIGHLIGHT,			// 13
		ColorHighlightText = COLOR_HIGHLIGHTTEXT,	// 14
		ColorBtnFace = COLOR_BTNFACE,				// 15
		ColorBtnShadow = COLOR_BTNSHADOW,			// 16
		ColorGrayText = COLOR_GRAYTEXT,				// 17
		ColorBtnText = COLOR_BTNTEXT,				// 18
		ColorInactiveCaptionText = COLOR_INACTIVECAPTIONTEXT, // 19
		ColorBtnHighlight = COLOR_BTNHIGHLIGHT,		// 20
		Color3DDkShadow = COLOR_3DDKSHADOW,			// 21
		Color3DLight = COLOR_3DLIGHT,				// 22
		ColorInfoText = COLOR_INFOTEXT,				// 23
		ColorInfoBk = COLOR_INFOBK,					// 24
		Color25 = 25,
		ColorHotlight = COLOR_HOTLIGHT,				// 26,
		ColorGradientActiveCaption = COLOR_GRADIENTACTIVECAPTION,   //27
		ColorGradientInactiveCaption = COLOR_GRADIENTINACTIVECAPTION, //28
		ColorMenulight = COLOR_MENUHILIGHT,		// 29
		ColorMenuBar = COLOR_MENUBAR,			// 30
		ColorSystemLast = COLOR_MENUBAR,		// Last System color
		// 
		ColorBorder = 31,
		ColorToolbarTop = COLOR_WINDOW,
		ColorToolbarBottom = COLOR_3DFACE,
		ColorRedNumbers = 32,
		ColorBackground2 = 33,
		ColorCaptionTop = 34,
		ColorCaptionBottom = 35,
		ColorBtnFaceLight = 36,
		ColorExcelSelect = 37,
		ColorDialogBorder = 38,
		ColorMask = 39,
		ColorBackSpecial = 40,
		ColorBackError = 41,
		ColorBackWarning = 42,
		ColorOutlineWarning = 43,
		//--------------------
		ColorLast = 43,
		ColorCount = ColorLast + 1,
	};

	static CFont* GetUIFont(FontType ft = FontNormal);
	static int GetFontHeight(FontType = FontNormal);
	static CImageList* GetImageList(ImageListType type = ImageList16x16);
	static COLORREF GetRealColor(ColorType ct);

	static void OnSettingChange();
private:
	CTheme(); // decalre only
	~CTheme();
	static CFont  m_fonts[FontTypeCount];
	static CImageList m_imageLists[ImageListCount];
	static COLORREF m_colors[ColorCount];
};

class CThemeFontSDC : public CGdiObjectSDC
{
public:
	CThemeFontSDC(CDC* pDC, CTheme::FontType ft = CTheme::FontNormal)
		: CGdiObjectSDC(OBJ_FONT, pDC, NULL)
	{
		if (ft == CTheme::FontNone)
			return;
		CFont* pFont = CTheme::GetUIFont(ft);
		if (pFont)
			Set(pFont->GetSafeHandle());
	}
};

#undef AFX_DATA
#define AFX_DATA

