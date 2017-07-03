#pragma once

class CFormElement : public CFormItem
{
public:
	CFormElement();
	virtual void Draw(const RENDER_INFO& ri) override;
	virtual DWORD GetTrackMask() const override { return RTRE_SIZEONLY; }

protected:
	virtual void SetXamlAttributes(void* node) override;
};
