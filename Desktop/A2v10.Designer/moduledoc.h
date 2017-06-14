#pragma once


class CModuleDoc : public CDocument
{
	DECLARE_DYNCREATE(CModuleDoc)

public:
	CModuleDoc();
	virtual ~CModuleDoc();

protected:
	virtual BOOL OnNewDocument();

	DECLARE_MESSAGE_MAP()
};

