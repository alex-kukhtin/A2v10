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

	enum ImageListType {
		ImageList16x16 = 0,
		ImageList10x10 = 1,
		//----------------
		ImageListLast = 1,
		ImageListCount = ImageListLast + 1,
	};


	static CFont* GetUIFont(FontType ft = FontNormal);
	static CImageList* GetImageList(ImageListType type = ImageList16x16);

	static void OnSettingChange();
private:
	CTheme(); // decalre only
	~CTheme();
	static CFont  m_fonts[FontTypeCount];
	static CImageList m_imageLists[ImageListCount];
};

#undef AFX_DATA
#define AFX_DATA

