#pragma once

#pragma once

class tinyxml2::XMLElement;
class CA2FormDocument;

class CGridElement : public CFormItem
{
public:
	CGridElement(CA2FormDocument* pDoc, tinyxml2::XMLElement* pNode);
	virtual LPCWSTR ElementName() override { return L"Grid"; }
	virtual void Draw(const RENDER_INFO& ri) override;
};
