
#pragma once


class CButtonElement : public CFormItem
{
	DECLARE_DYNCREATE(CButtonElement)

public:
	virtual LPCWSTR ElementName() override { return L"Button"; }
	virtual void Draw(const RENDER_INFO& ri) override;
	virtual void Xml2Properties() override;
};

