// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

#pragma once


class CGridElement : public CFormItem
{
	DECLARE_DYNCREATE(CGridElement)

	CMap<CFormItem*, CFormItem*&, int, int> m_attachedRow;
	CMap<CFormItem*, CFormItem*&, int, int> m_attachedCol;
public:
	virtual LPCWSTR ElementName() override { return L"Grid"; }
	virtual void Draw(const RENDER_INFO& ri) override;
	virtual void AddAttachedProperty(const wchar_t* name, int value, CFormItem* pItem) override;
	virtual void SetAttachedPropertyToXml(CFormItem* pItem) override;
	virtual void Measure(const CSize& available) override;
	virtual void Arrange(const CRect& position) override;
	virtual CRect AdjustTrackRect(CFormItem* pItem, const CRect& rect, const CPoint& offset) override;
	virtual void OnSetPositionChild(CFormItem* pItem) override;
protected:
};
