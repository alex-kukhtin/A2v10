
#pragma once


class CTextBoxElement : public CFormItem
{
	DECLARE_DYNCREATE(CTextBoxElement)

public:
	virtual LPCWSTR ElementName() override { return L"TextBox"; }
	virtual void Draw(const RENDER_INFO& ri) override;
	virtual void Measure(const CSize& available);
};
