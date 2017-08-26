#pragma once

class tinyxml2::XMLElement;
class CA2FormDocument;

class CFormElement : public CFormItem
{
	DECLARE_DYNCREATE(CFormElement)

	CString m_title;
public:

	virtual LPCWSTR ElementName() override { return L"Form"; }

	virtual void Draw(const RENDER_INFO& ri) override;
	virtual CFormItem& operator=(const CFormItem& other) override;

	virtual DWORD GetTrackMask() const override { return RTRE_SIZEONLY; }
	virtual void Xml2Properties() override;
	virtual void Properties2Xml() override;
	virtual void OnJsPropertyChange(LPCWSTR szPropName) override;
};
