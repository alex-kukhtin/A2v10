#pragma once


class CFormXamlView : public CXamlEditView
{
	DECLARE_DYNCREATE(CFormXamlView);
public:
	CA2FormDocument* GetDocument() const;
protected:
	virtual void SavePointLeft() override;
	virtual void OnActivateView(BOOL bActivate, CView* pActivateView, CView* pDeactiveView) override;
};

