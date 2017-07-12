
#include "stdafx.h"

#include "sciview.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

#define SCI_CLASS L"Scintilla"

const DWORD dwStyleDefault = WS_CHILD | WS_VISIBLE | WS_CLIPCHILDREN | WS_HSCROLL | WS_VSCROLL;

struct FOLD_INFO {
	LPCSTR param;
	LPCSTR value;
};


IMPLEMENT_DYNCREATE(CSciEditView, CCtrlView)

CSciEditView::CSciEditView()
	: CCtrlView(SCI_CLASS, NULL)
{
}

// virtual 
CSciEditView::~CSciEditView()
{
}

// virtual 
BOOL CSciEditView::PreCreateWindow(CREATESTRUCT& cs)
{
	m_dwDefaultStyle = dwStyleDefault;
	return __super::PreCreateWindow(cs);
}

CStringA CSciEditView::GetTextA()
{
	int len = GetCurrentDocLen();
	// ANSI!
	CStringA ansiText;
	LPSTR buff = ansiText.GetBuffer(len + 1);
	SendMessage(SCI_GETTEXT, len + 1 /*with \0!*/, reinterpret_cast<LPARAM>(buff));
	ansiText.ReleaseBuffer();
	return ansiText;
}

CString CSciEditView::GetText()
{
	USES_CONVERSION;
	CStringA ansiA = GetTextA();
	return CString(A2W_CP(ansiA.GetString(), CP_UTF8));
}

void CSciEditView::SetReadOnly(bool bSet)
{
	SendMessage(SCI_SETREADONLY, bSet, 0);
}

void CSciEditView::SetText(LPCWSTR szText)
{
	// UTF8
	USES_CONVERSION;
	LPCSTR szAnsi = W2A_CP(szText, CP_UTF8);
	SendMessage(SCI_SETTEXT, 0, reinterpret_cast<LPARAM>((LPCSTR)szAnsi));
}

void CSciEditView::SetTextA(LPCSTR szText) {
	SendMessage(SCI_SETTEXT, 0, reinterpret_cast<LPARAM>((LPCSTR)szText));
}

void CSciEditView::SetSavePoint()
{
	SendMessage(SCI_EMPTYUNDOBUFFER);
	SendMessage(SCI_SETSAVEPOINT);
}


// virtual 
void CSciEditView::SetupEditor()
{
	CString strFont = CUITools::GetMonospaceFontFamily();

	COLORREF grayColor = RGB(165, 165, 165);
	COLORREF whiteColor = RGB(255, 255, 255);
	COLORREF lineNumbersColor = RGB(43, 145, 175);
	COLORREF marginBack = RGB(248, 248, 248);

	SendMessage(SCI_SETEOLMODE, SC_EOL_CRLF); // Windows EOL

	CStringA strFontA(strFont); // ANSI!
	SendMessage(SCI_STYLESETFONT, STYLE_DEFAULT, reinterpret_cast<LPARAM>((LPCSTR)strFontA));
	SendMessage(SCI_STYLESETSIZE, STYLE_DEFAULT, 11);
	SendMessage(SCI_SETCODEPAGE, SC_CP_UTF8, 0L);

	SendMessage(SCI_SETTABWIDTH, 4);
	SendMessage(SCI_SETMARGINS, 3); // Marker, LineNumber, Fold
	SendMessage(SCI_STYLESETBACK, STYLE_LINENUMBER, marginBack);

	// indentation guides
	SendMessage(SCI_SETINDENTATIONGUIDES, SC_IV_LOOKBOTH);

	//SendMessage(SCI_SETMARGINTYPEN, SC_MARGIN_BACK, SC_MARGIN_SYMBOL);
	SendMessage(SCI_SETMARGINMASKN, SC_MARGIN_BACK, SC_MASK_FOLDERS);
	SendMessage(SCI_SETMARGINSENSITIVEN, SC_MARGIN_BACK, TRUE);
	SendMessage(SCI_SETMARGINWIDTHN, SC_MARGIN_BACK, 12); /*folder symbol size*/

	// folder margin bar color
	SendMessage(SCI_SETFOLDMARGINCOLOUR, TRUE, whiteColor);
	SendMessage(SCI_SETFOLDMARGINHICOLOUR, TRUE, whiteColor);

	// selection color
	COLORREF selectionColor = RGB(173, 214, 255);
	SendMessage(SCI_SETSELBACK, 1, selectionColor);

	// indent guide color
	SendMessage(SCI_STYLESETFORE, STYLE_INDENTGUIDE, grayColor);

	// brace color
	COLORREF braceLightColor = RGB(226, 230, 214);
	COLORREF braceBadColor = RGB(238, 204, 187);
	COLORREF tagMatchColor = RGB(176, 181, 162);

	SendMessage(SCI_STYLESETBACK, STYLE_BRACELIGHT, braceLightColor);
	SendMessage(SCI_STYLESETBACK, STYLE_BRACEBAD, braceBadColor);

	// tag match
	/*
	SendMessage(SCI_INDICSETSTYLE, SCE_UNIVERSAL_TAGMATCH, INDIC_FULLBOX);
	SendMessage(SCI_INDICSETUNDER, SCE_UNIVERSAL_TAGMATCH, false);
	SendMessage(SCI_INDICSETFORE, SCE_UNIVERSAL_TAGMATCH, tagMatchColor);
	*/

	struct FOLD_STYLE_INFO {
		WPARAM type;
		LPARAM mark;
		COLORREF fore;
		COLORREF back;
	};

	FOLD_STYLE_INFO folds[] = {
		{ SC_MARKNUM_FOLDEROPEN, SC_MARK_BOXMINUS,	whiteColor, grayColor },
		{ SC_MARKNUM_FOLDER,	 SC_MARK_BOXPLUS,	whiteColor, grayColor },
		{ SC_MARKNUM_FOLDERSUB,	 SC_MARK_VLINE,		grayColor,	grayColor },
		{ SC_MARKNUM_FOLDERTAIL, SC_MARK_LCORNER,	grayColor,	grayColor },
		{ SC_MARKNUM_FOLDEREND,  SC_MARK_BOXPLUSCONNECTED, whiteColor, grayColor },
		{ SC_MARKNUM_FOLDEROPENMID, SC_MARK_BOXMINUSCONNECTED, whiteColor, grayColor },
		{ SC_MARKNUM_FOLDERMIDTAIL, SC_MARK_TCORNER,grayColor,	grayColor }
	};

	for (int i = 0; i < _countof(folds); i++) {
		FOLD_STYLE_INFO& fi = folds[i];
		SendMessage(SCI_MARKERDEFINE, fi.type, fi.mark);
		SendMessage(SCI_MARKERSETFORE, fi.type, fi.fore);
		SendMessage(SCI_MARKERSETBACK, fi.type, fi.back);
	}

	// draw line below if not expanded
	// SendMessage(SCI_SETFOLDFLAGS, SC_FOLDFLAG_LINEAFTER_CONTRACTED);
	// enable automatic folding
	WORD foldFlags = SC_AUTOMATICFOLD_SHOW | SC_AUTOMATICFOLD_CLICK | SC_AUTOMATICFOLD_CHANGE;
	SendMessage(SCI_SETAUTOMATICFOLD, foldFlags, 0);


	COLORREF currentLineColor = RGB(255, 216, 56);
	// Current position marker
	SendMessage(SCI_MARKERDEFINE,  MARKER_CURRENT_LINE, SC_MARK_SHORTARROW);
	SendMessage(SCI_MARKERSETFORE, MARKER_CURRENT_LINE, grayColor);
	SendMessage(SCI_MARKERSETBACK, MARKER_CURRENT_LINE, currentLineColor);

	// Line numbers
	if (true) {
		SendMessage(SCI_SETMARGINTYPEN, MARGIN_LINENUMBER, SC_MARGIN_NUMBER);
		int textWidth = SendMessage(SCI_TEXTWIDTH, STYLE_DEFAULT, (LPARAM)(const char*) "_99");
		SendMessage(SCI_SETMARGINWIDTHN, MARGIN_LINENUMBER, textWidth);
		SendMessage(SCI_STYLESETFORE, STYLE_LINENUMBER, lineNumbersColor);
	}
}

BEGIN_MESSAGE_MAP(CSciEditView, CCtrlView)
	ON_WM_CREATE()
	ON_COMMAND(ID_EDIT_COPY, OnEditCopy)
	ON_COMMAND(ID_EDIT_CUT, OnEditCut)
	ON_COMMAND(ID_EDIT_PASTE, OnEditPaste)
	ON_UPDATE_COMMAND_UI(ID_EDIT_PASTE, OnUpdateEditPaste)
	ON_COMMAND(ID_EDIT_UNDO, OnEditUndo)
	ON_UPDATE_COMMAND_UI(ID_EDIT_UNDO, OnUpdateEditUndo)
	ON_COMMAND(ID_EDIT_REDO, OnEditRedo)
	ON_UPDATE_COMMAND_UI(ID_EDIT_REDO, OnUpdateEditRedo)
	ON_WM_CONTEXTMENU()
	ON_COMMAND(ID_EDIT_SELECT_ALL, OnEditSelectAll)
	ON_NOTIFY_REFLECT(SCN_CHARADDED, OnCharAdded)
	ON_NOTIFY_REFLECT(SCN_UPDATEUI, OnUpdateUi)
	ON_NOTIFY_REFLECT(SCN_SAVEPOINTLEFT, OnSavePointLeft)
END_MESSAGE_MAP()

int CSciEditView::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if (__super::OnCreate(lpCreateStruct) == -1)
		return -1;
	SetupEditor();

	return 0;
}


// virtual
void CSciEditView::OnUpdate(CView* pSender, LPARAM lHint, CObject* pHint)
{
	switch (lHint) {
	case HINT_DOCUMENT_SAVED:
		SetSavePoint();
		break;
	}
}

int CSciEditView::GetCurrentLine() const
{
	return long(SendMessage(SCI_LINEFROMPOSITION, GetCurrentPos()));
}

int CSciEditView::GetLineIndent(int line) const
{
	return (long)SendMessage(SCI_GETLINEINDENTATION, line);
}

long CSciEditView::GetLineLength(int line) const
{
	long lineEnd = (long) SendMessage(SCI_GETLINEENDPOSITION, line);
	long lineStart = (long) SendMessage(SCI_POSITIONFROMLINE, line);
	return lineEnd - lineStart;
};


long CSciEditView::GetCurrentPos() const
{
	return (long)SendMessage(SCI_GETCURRENTPOS);
}

long CSciEditView::GetCurrentDocLen() const
{
	return (long)SendMessage(SCI_GETLENGTH);
}

void CSciEditView::GetText(char* dest, Sci_PositionCR start, Sci_PositionCR end) const
{
	Sci_TextRange tr;
	tr.chrg.cpMin = start;
	tr.chrg.cpMax = end;
	tr.lpstrText = dest;
	SendMessage(SCI_GETTEXTRANGE, 0, reinterpret_cast<LPARAM>(&tr));
}

void CSciEditView::ClearIndicator(int num)
{
	int s = 0;
	int e = GetCurrentDocLen();
	SendMessage(SCI_SETINDICATORCURRENT, num);
	SendMessage(SCI_INDICATORCLEARRANGE, s, e - s);
};

void CSciEditView::AutoIndent(const char ch)
{
	int curLine = GetCurrentLine();
	int prevLine = curLine - 1;
	while (prevLine >= 0 && GetLineLength(prevLine) == 0)
		prevLine--;
	if (prevLine < 0)
		return;
	int prevIndent = GetLineIndent(prevLine);
	SetLineIndent(curLine, prevIndent);
}

void CSciEditView::SetLineIndent(int line, int indent)
{
	if (line == 0)
		return;
	int prevLine = line - 1;
	Sci_TextRange tr;
	int len = GetLineLength(prevLine);
	int posStart = SendMessage(SCI_POSITIONFROMLINE, prevLine);
	CStringA ansiText;
	LPSTR buff = ansiText.GetBuffer(len + 1);
	tr.chrg.cpMin = posStart;
	tr.chrg.cpMax = posStart + len;
	char* buf = ansiText.GetBuffer(len + 1);
	tr.lpstrText = ansiText.GetBuffer(len + 1);
	SendMessage(SCI_GETTEXTRANGE, 0, reinterpret_cast<LPARAM>(&tr));
	buf[len] = '\0';
	ansiText.ReleaseBuffer();
	CStringA newLine = ansiText;
	buff = newLine.GetBuffer();
	for (int i=0; buff[i]; i++) {
		char ch = buff[i];
		if (ch != ' ' && ch != '\t') {
			buff[i] = '\0';
		}
	}
	newLine.ReleaseBuffer();
	SendMessage(SCI_REPLACESEL, 0, reinterpret_cast<LPARAM>(newLine.GetString()));
}

// afx_msg
void CSciEditView::OnEditCopy()
{
	SendMessage(WM_COPY);
}
// afx_msg
void CSciEditView::OnEditCut()
{
	SendMessage(WM_CUT);
}

// afx_msg
void CSciEditView::OnEditPaste()
{
	SendMessage(WM_PASTE);
}

// afx_msg 
void CSciEditView::OnUpdateEditPaste(CCmdUI* pCmdUI)
{
	pCmdUI->Enable(SendMessage(EM_CANPASTE) ? TRUE : FALSE);
}

// afx_msg
void CSciEditView::OnEditUndo()
{
	SendMessage(SCI_UNDO);
}

// afx_msg 
void CSciEditView::OnUpdateEditUndo(CCmdUI* pCmdUI)
{
	pCmdUI->Enable(SendMessage(SCI_CANUNDO) ? TRUE : FALSE);
}

// afx_msg
void CSciEditView::OnEditRedo()
{
	SendMessage(SCI_REDO);
}

// afx_msg 
void CSciEditView::OnUpdateEditRedo(CCmdUI* pCmdUI)
{
	pCmdUI->Enable(SendMessage(SCI_CANREDO) ? TRUE : FALSE);
}

// virtual  
BOOL CSciEditView::OnCmdMsg(UINT nID, int nCode, void* pExtra, AFX_CMDHANDLERINFO* pHandlerInfo)
{
	if (CUITools::TryDoCmdMsg(nID, nCode, pExtra, pHandlerInfo))
		return TRUE;
	return __super::OnCmdMsg(nID, nCode, pExtra, pHandlerInfo);
}


void CSciEditView::OnEditSelectAll()
{
	PostMessage(SCI_SELECTALL);
}

void CSciEditView::OnContextMenu(CWnd* pWnd, CPoint point)
{
	if (pWnd->GetSafeHwnd() != GetSafeHwnd())
	{
		__super::OnContextMenu(pWnd, point);
		return;
	}
	SetFocus();
	int subMenu = GetContextMenuPopupIndex();
	if (subMenu == -1) {
		ATLASSERT(FALSE);
		return;
	}
	CUITools::TrackPopupMenu(IDM_POPUP_MENU, subMenu, this, point);
}


// afx_msg
void CSciEditView::OnCharAdded(NMHDR* pNMHDR, LRESULT* pResult)
{
	SCNotification* pSCN = reinterpret_cast<SCNotification*>(pNMHDR);
	char ch = pSCN->ch;
	if (ch == '\n')
		AutoIndent(pSCN->ch);
	/*
	ATLASSERT(m_pAutoCompletion);
	m_pAutoCompletion->InsertMatchedChar(pSCN->ch);
	*/
}

// afx_msg
void CSciEditView::OnUpdateUi(NMHDR* pNMHDR, LRESULT* pResult)
{
	SCNotification* pSCN = reinterpret_cast<SCNotification*>(pNMHDR);
	if (pSCN->nmhdr.hwndFrom != GetSafeHwnd())
		return;
	//ATLTRACE(L"update ui: %d\n", pSCN->updated);
	/*
	braceMatch();
	if (IsHtmlLikeLang()) {
		CXmlTagFinder xmlTagFinder(this);
		xmlTagFinder.TagMatch();
	}
	*/
}

// afx_msg
void CSciEditView::OnSavePointLeft(NMHDR* pNMHDR, LRESULT* pResult)
{
	SCNotification* pSCN = reinterpret_cast<SCNotification*>(pNMHDR);
	if (pSCN->nmhdr.hwndFrom != GetSafeHwnd())
		return;
	GetDocument()->SetModifiedFlag(TRUE);
}

IMPLEMENT_DYNCREATE(CJsEditView, CSciEditView)

// virtual 
void CJsEditView::SetupEditor()
{
	__super::SetupEditor();
	// JavaScriptEditor
	SendMessage(SCI_SETLEXER, SCLEX_CPP);

	/*fold for JS*/
	FOLD_INFO jsFolds[] =
	{
		{ "fold", "1" },
		{ "fold.compact", "0" },
		{ "fold.comment", "1" },
		{ "fold.preprocessor", "1" },
		// Disable track preprocessor to avoid incorrect detection.
		// In the most of cases, the symbols are defined outside of file.
		{ "lexer.cpp.track.preprocessor", "0" },
		{ "lexer.cpp.backquoted.strings", "1" },
	};

	for (int i = 0; i < _countof(jsFolds); i++) {
		FOLD_INFO& fi = jsFolds[i];
		SendMessage(SCI_SETPROPERTY, reinterpret_cast<WPARAM>(fi.param), reinterpret_cast<LPARAM>(fi.value));
	}


	const char* jsInstr1 = "abstract boolean break byte case catch char class const continue debugger default delete do double else enum export extends final finally float for from function goto if implements import in instanceof int interface let long native new null of package private protected public return short static super switch synchronized this throw throws transient try typeof var void volatile while with true false prototype";
	const char* jsType1 = "Array Date eval hasOwnProperty Infinity isFinite isNaN isPrototypeOf Math NaN Number Object String toString undefined valueOf alert confirm";

	SendMessage(SCI_SETKEYWORDS, 0, reinterpret_cast<LPARAM>(jsInstr1));
	SendMessage(SCI_SETKEYWORDS, 1, reinterpret_cast<LPARAM>(jsType1));

	COLORREF keywordText = RGB(0, 0, 255);
	COLORREF stringText = RGB(163, 21, 21);
	COLORREF type1Text = RGB(0, 128, 128);
	COLORREF commentText = RGB(0, 128, 0);
	COLORREF numberText = RGB(0, 0, 128);
	COLORREF regExText = RGB(128, 0, 128);

	SendMessage(SCI_STYLESETFORE, SCE_C_WORD, keywordText);
	SendMessage(SCI_STYLESETFORE, SCE_C_WORD2, type1Text);
	SendMessage(SCI_STYLESETFORE, SCE_C_STRING, stringText);    // ""
	SendMessage(SCI_STYLESETFORE, SCE_C_CHARACTER, stringText); // ''
	SendMessage(SCI_STYLESETFORE, SCE_C_STRINGRAW, stringText); // ``
	SendMessage(SCI_STYLESETFORE, SCE_C_NUMBER, numberText);
	SendMessage(SCI_STYLESETFORE, SCE_C_COMMENT, commentText);
	SendMessage(SCI_STYLESETFORE, SCE_C_COMMENTDOC, commentText);
	SendMessage(SCI_STYLESETFORE, SCE_C_COMMENTLINE, commentText);
	SendMessage(SCI_STYLESETFORE, SCE_C_COMMENTLINEDOC, commentText);
	SendMessage(SCI_STYLESETFORE, SCE_C_REGEX, regExText);
}



IMPLEMENT_DYNCREATE(CXamlEditView, CSciEditView)

// virtual 
void CXamlEditView::SetupEditor()
{
	__super::SetupEditor();
	// JavaScriptEditor
	SendMessage(SCI_SETLEXER, SCLEX_XML);

	/*fold for XML*/
	FOLD_INFO jsFolds[] =
	{
		{ "fold", "1" },
		{ "fold.compact", "0" },
		{ "fold.html", "1" },
		{ "fold.hypertext.comment", "1" },
	};

	for (int i = 0; i < _countof(jsFolds); i++) {
		FOLD_INFO& fi = jsFolds[i];
		SendMessage(SCI_SETPROPERTY, reinterpret_cast<WPARAM>(fi.param), reinterpret_cast<LPARAM>(fi.value));
	}


	COLORREF tagText = RGB(128, 0, 0);
	COLORREF attrText = RGB(255, 0, 0);
	COLORREF stringText = RGB(0, 0, 255);
	COLORREF commentText = RGB(0, 128, 0);
	COLORREF cDataColor = RGB(116, 128, 128);
	COLORREF cEntityColor = RGB(128, 0, 128);
	//COLORREF numberText = RGB(0, 0, 128);


	SendMessage(SCI_STYLESETFORE, SCE_H_TAG, tagText);
	SendMessage(SCI_STYLESETFORE, SCE_H_ATTRIBUTE, attrText);
	SendMessage(SCI_STYLESETFORE, SCE_H_DOUBLESTRING, stringText);
	SendMessage(SCI_STYLESETFORE, SCE_H_CDATA, cDataColor);
	SendMessage(SCI_STYLESETFORE, SCE_H_ENTITY, cEntityColor);

	/*SCE_H_DOUBLESTRING
	SendMessage(SCI_STYLESETFORE, SCE_C_WORD2, type1Text);
	SendMessage(SCI_STYLESETFORE, SCE_C_STRING, stringText);
	SendMessage(SCI_STYLESETFORE, SCE_C_CHARACTER, stringText);
	//SendMessage(SCI_STYLESETFORE, SCE_C_NUMBER, numberText);
	SendMessage(SCI_STYLESETFORE, SCE_C_COMMENTDOC, commentText);
	SendMessage(SCI_STYLESETFORE, SCE_C_COMMENTLINE, commentText);
	SendMessage(SCI_STYLESETFORE, SCE_C_COMMENTLINEDOC, commentText);
	*/
	SendMessage(SCI_STYLESETFORE, SCE_H_COMMENT, commentText);
}
