#pragma once

struct RENDER_INFO;
class CFormItem;
class CXamlEditView;

class CA2FormDocument : public CDocument
{
protected: // create from serialization only
	CA2FormDocument();
	DECLARE_DYNCREATE(CA2FormDocument)

	tinyxml2::XMLDocument m_xmlDocument;
	CFormItem* m_pRoot;
	bool m_bXmlModified;
	bool m_bTextModified;
	bool m_bPropertyChanged;
public:
	virtual ~CA2FormDocument();
	void ClearRoot();
	void ClearSelection();

	void DrawContent(const RENDER_INFO& ri);

	bool IsLocked() const;
	CFormItem* ObjectAt(CPoint point);
	
	bool IsModifiedXml() const { return m_bXmlModified; }
	bool IsModifiedText() const { return m_bTextModified; }
	void SetXmlTextFromXml();
	void SetXmlFromXmlText();
	virtual BOOL OnNewDocument() override;
	virtual void OnCloseDocument() override;
	virtual BOOL CanCloseFrame(CFrameWnd* pFrame) override;
	virtual void Serialize(CArchive& ar) override;
	virtual void SetModifiedFlag(BOOL bModified = TRUE) override;

	void SetModifiedXml(bool bModified = true);
	void SetModifiedText(bool bModified = true);

#ifdef SHARED_HANDLERS
	virtual void InitializeSearchContent();
	virtual void OnDrawThumbnail(CDC& dc, LPRECT lprcBounds);
#endif // SHARED_HANDLERS

protected:
	void DrawSelection(const RENDER_INFO& ri);
	void CreateRootElement();
	void Xml2Form();
	void Clear();
	CXamlEditView* GetXamlEditView();
	void ParseXml(const char* szXml);
	void LoadDocument(CFile* pFile, CXamlEditView* pView);
	void SaveDocument(CFile* pFile, CXamlEditView* pView);

	DECLARE_MESSAGE_MAP()

#ifdef SHARED_HANDLERS
	// Helper function that sets search content for a Search Handler
	void SetSearchContent(const CString& value);
#endif // SHARED_HANDLERS
};

