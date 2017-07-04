#pragma once

class CFormElement : public CFormItem
{
public:
	CFormElement();
	virtual LPCWSTR ElementName() override { return L"Form"; }
	virtual void Draw(const RENDER_INFO& ri) override;
	virtual DWORD GetTrackMask() const override { return RTRE_SIZEONLY; }

protected:
	virtual void SetXamlAttributes(tinyxml2::XMLElement* node) override;
};
