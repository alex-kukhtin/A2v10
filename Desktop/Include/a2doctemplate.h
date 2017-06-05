#pragma once

#undef AFX_DATA
#define AFX_DATA AFX_BASE_DATA

class CA2DocTemplate : public CMultiDocTemplate
{
	DECLARE_DYNAMIC(CA2DocTemplate)
public:
	CA2DocTemplate(UINT nIDResource, CRuntimeClass* pDocClass,
		CRuntimeClass* pFrameClass, CRuntimeClass* pViewClass);
	virtual ~CA2DocTemplate();

	virtual void LoadTemplate();

protected:
	void LoadAndMegeMenu();
};

#undef AFX_DATA
#define AFX_DATA
