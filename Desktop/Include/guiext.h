#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA


class CDisableRedraw
{
	CWnd* m_pWnd;
public:
	CDisableRedraw(CWnd* pWnd)
		: m_pWnd(pWnd)
	{
		m_pWnd->SetRedraw(FALSE);
	}
	~CDisableRedraw()
	{
		m_pWnd->SetRedraw(TRUE);
	}
};

class CLockUpdate
{
	CWnd* m_pWnd;
public:
	CLockUpdate(CWnd* pWnd)
		: m_pWnd(pWnd)
	{
		m_pWnd->LockWindowUpdate();
	}
	~CLockUpdate()
	{
		m_pWnd->UnlockWindowUpdate();
	}
};


class CGdiObjectSDC
{
	HDC m_hDC;
	HGDIOBJ m_hSaveObj;
	UINT m_objType;
#ifdef _DEBUG
	HGDIOBJ m_hCheckObj;
#endif
public:
	CGdiObjectSDC(UINT objType, CDC* pDC, HGDIOBJ hObj)
		: m_hDC(pDC->GetSafeHdc()), m_hSaveObj(NULL), m_objType(objType)
	{
#ifdef _DEBUG
		m_hCheckObj = ::GetCurrentObject(m_hDC, m_objType);
#endif
		Set(hObj);
	}
	~CGdiObjectSDC()
	{
		Dispose();
#ifdef _DEBUG
		ATLASSERT(m_hCheckObj == ::GetCurrentObject(m_hDC, m_objType));
#endif
	}
	void Set(HGDIOBJ hObj)
	{
		ATLASSERT(m_hSaveObj == NULL);
		if (m_hSaveObj != NULL)
			return;
		if (m_hDC && hObj)
			m_hSaveObj = ::SelectObject(m_hDC, hObj);
	}
	void Dispose()
	{
		if (m_hDC && m_hSaveObj)
			::SelectObject(m_hDC, m_hSaveObj);
		m_hSaveObj = NULL;
	}
};

class CTextColorSDC
{
	HDC m_hDC;
	COLORREF m_oldClr;
#ifdef _DEBUG
	COLORREF m_checkColor;
#endif
public:
	CTextColorSDC(CDC* pDC, COLORREF clr = UNKNOWN_COLOR)
		: m_hDC(pDC->GetSafeHdc()), m_oldClr(UNKNOWN_COLOR)
	{
#ifdef _DEBUG
		m_checkColor = ::GetTextColor(m_hDC);
#endif
		Set(clr);
	}
	void Set(COLORREF clr = UNKNOWN_COLOR)
	{
		if (m_oldClr != UNKNOWN_COLOR)
			return; // already set
		if (m_hDC && (clr != UNKNOWN_COLOR))
			m_oldClr = ::SetTextColor(m_hDC, clr);
	}
	void Dispose()
	{
		if (m_hDC && (m_oldClr != UNKNOWN_COLOR))
			::SetTextColor(m_hDC, m_oldClr);
		m_oldClr = UNKNOWN_COLOR;
	}
	~CTextColorSDC()
	{
		Dispose();
#ifdef _DEBUG
		ATLASSERT(m_checkColor == ::GetTextColor(m_hDC));
#endif
	}
};

class CBkColorSDC
{
	HDC m_hDC;
	COLORREF m_oldClr;
#ifdef _DEBUG
	COLORREF m_checkColor;
#endif
public:
	CBkColorSDC(CDC* pDC, COLORREF clr = UNKNOWN_COLOR)
		: m_hDC(pDC->GetSafeHdc()), m_oldClr(UNKNOWN_COLOR)
	{
#ifdef _DEBUG
		m_checkColor = ::GetBkColor(m_hDC);
#endif
		Set(clr);
	}
	void Set(COLORREF clr = UNKNOWN_COLOR)
	{
		if (m_oldClr != UNKNOWN_COLOR)
			return; // already set
		if (m_hDC && (clr != UNKNOWN_COLOR))
			m_oldClr = ::SetBkColor(m_hDC, clr);
	}
	void Dispose()
	{
		if (m_hDC && (m_oldClr != UNKNOWN_COLOR))
			::SetBkColor(m_hDC, m_oldClr);
		m_oldClr = UNKNOWN_COLOR;
	}
	~CBkColorSDC()
	{
		Dispose();
#ifdef _DEBUG
		ATLASSERT(m_checkColor == ::GetBkColor(m_hDC));
#endif
	}
};

class CBrushSDC : public CBrush
{
	HDC m_hDC;
	HGDIOBJ m_hOldBrush;
#ifdef _DEBUG
	HGDIOBJ m_hCheckBrush;
#endif
public:
	CBrushSDC(CDC* pDC, COLORREF clr = UNKNOWN_COLOR)
		: m_hDC(pDC->GetSafeHdc()), m_hOldBrush(NULL)
	{
		Set(clr);
	}
	void Set(COLORREF clr = UNKNOWN_COLOR)
	{
#ifdef _DEBUG
		m_hCheckBrush = ::GetCurrentObject(m_hDC, OBJ_BRUSH);
#endif
		ATLASSERT(m_hOldBrush == NULL);
		if (m_hOldBrush != NULL)
			return;
		if (m_hDC) {
			if (clr != UNKNOWN_COLOR) {
				CreateSolidBrush(clr);
				m_hOldBrush = ::SelectObject(m_hDC, GetSafeHandle());
			}
			else {
				m_hOldBrush = SelectObject(m_hDC, GetStockObject(HOLLOW_BRUSH));
			}
		}
	}
	void Dispose()
	{
		if (m_hDC && m_hOldBrush)
			SelectObject(m_hDC, m_hOldBrush);
		m_hOldBrush = NULL;
	}
	~CBrushSDC()
	{
		Dispose();
#ifdef _DEBUG
		HGDIOBJ hCurrentBrush = ::GetCurrentObject(m_hDC, OBJ_BRUSH);
		ATLASSERT(m_hCheckBrush == hCurrentBrush);
#endif
	}
};

class CPenSDC : public CPen
{
	HDC m_hDC;
	HGDIOBJ m_hOldPen;
#ifdef _DEBUG
	HGDIOBJ m_hCheckPen;
#endif
public:
	CPenSDC(CDC* pDC, COLORREF clr = UNKNOWN_COLOR)
		: m_hDC(pDC->GetSafeHdc()), m_hOldPen(NULL)
	{
		Set(PS_INSIDEFRAME, -1, clr);
	}
	CPenSDC(CDC* pDC, int penStyle, int nWidth = -1, COLORREF clr = UNKNOWN_COLOR)
		: m_hDC(pDC->GetSafeHdc()), m_hOldPen(NULL)
	{
		Set(penStyle, nWidth, clr);
	}
	void Set(int penStyle = PS_INSIDEFRAME, int nWidth = -1, COLORREF clr = UNKNOWN_COLOR)
	{
#ifdef _DEBUG
		m_hCheckPen = ::GetCurrentObject(m_hDC, OBJ_PEN);
#endif
		ATLASSERT(m_hOldPen == NULL);
		if (m_hOldPen != NULL)
			return;
		if (m_hDC) {
			COLORREF penClr = clr;
			if (penClr == UNKNOWN_COLOR)
				penClr = 0; // BLACK_PEN 
			CreatePen(penStyle, nWidth, penClr);
			m_hOldPen = ::SelectObject(m_hDC, GetSafeHandle());
		}
	}
	void Dispose()
	{
		if (m_hDC && m_hOldPen)
			SelectObject(m_hDC, m_hOldPen);
		m_hOldPen = NULL;
	}
	~CPenSDC()
	{
		Dispose();
#ifdef _DEBUG
		HGDIOBJ hCurrentPen = ::GetCurrentObject(m_hDC, OBJ_PEN);
		ATLASSERT(m_hCheckPen == hCurrentPen);
#endif
	}
};

#undef AFX_DATA
#define AFX_DATA

