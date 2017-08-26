
#pragma once


class CTextBoxElement : public CFormItem
{
	DECLARE_DYNCREATE(CTextBoxElement)

public:
	CTextBoxElement()
		:__Row(0) {}
	virtual LPCWSTR ElementName() override { return L"TextBox"; }
	virtual void Draw(const RENDER_INFO& ri) override;
	virtual void Xml2Properties() override;

private:
	int __Row;
};
