
#pragma once


class CCheckBoxElement : public CFormItem
{
	DECLARE_DYNCREATE(CCheckBoxElement)

public:
	virtual LPCWSTR ElementName() override { return L"CheckBox"; }
	virtual void Draw(const RENDER_INFO& ri) override;
};


