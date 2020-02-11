// Copyright © 2020 Alex Kukhtin. All rights reserved.

#pragma once

class PosNullReceiptData : public JsonTarget
{
public:
	PosNullReceiptData()
		: m_openCashDrawer(false) {}
	bool m_openCashDrawer;
protected:
	BEGIN_JSON_PROPS(1)
		BOOL_PROP(openCashDrawer, m_openCashDrawer)
	END_JSON_PROPS()
};

class PosReceiptItemData : public JsonTarget
{
public:
	std::wstring _name;
	__int64 _article;
	__currency _price;
	__currency _qty;
	__currency _sum;
	__currency _discount;
	PosReceiptItemData()
		: _article(0) {}
protected:
	BEGIN_JSON_PROPS(6)
		STRING_PROP(name, _name)
		INT64_PROP(article, _article)
		CURRENCY_PROP(price, _price)
		CURRENCY_PROP(qty, _qty)
		CURRENCY_PROP(sum, _sum)
		CURRENCY_PROP(discount, _discount)
	END_JSON_PROPS()
};

class PosPrintReceiptData : public JsonTarget
{
public:
	std::wstring _topText;
	__currency _cashSum;
	__currency _cardSum;
	JsonTargetTypedArray<PosReceiptItemData> _items;

	PosPrintReceiptData() {}
protected:
	BEGIN_JSON_PROPS(4)
		STRING_PROP(topText, _topText)
		CURRENCY_PROP(cashSum, _cashSum)
		CURRENCY_PROP(cardSum, _cardSum)
		ARRAY_PROP(items, _items)
	END_JSON_PROPS()
};
