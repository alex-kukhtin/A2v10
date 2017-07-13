#pragma once

class tinyxml2::XMLElement;
class CA2FormDocument;

class CFormElement : public CFormItem
{
	CString m_title;
public:
	CFormElement(CA2FormDocument* pDoc, tinyxml2::XMLElement* pNode);
	virtual LPCWSTR ElementName() override { return L"Form"; }
	virtual void Draw(const RENDER_INFO& ri) override;
	virtual DWORD GetTrackMask() const override { return RTRE_SIZEONLY; }
	virtual void Xml2Properties() override;
	virtual void Properties2Xml() override;
};
