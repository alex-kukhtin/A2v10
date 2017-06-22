#pragma once


class CModuleDoc : public CDocument
{
	DECLARE_DYNCREATE(CModuleDoc)

public:
	CModuleDoc();
	virtual ~CModuleDoc();

	virtual void Serialize(CArchive& ar);
	virtual void SetModifiedFlag(BOOL bModified = TRUE);

protected:
	virtual BOOL OnNewDocument();

	DECLARE_MESSAGE_MAP()
};

