
#pragma once


class CGridElement : public CFormItem
{
	DECLARE_DYNCREATE(CGridElement)

public:
	virtual LPCWSTR ElementName() override { return L"Grid"; }
	virtual void Draw(const RENDER_INFO& ri) override;
};
