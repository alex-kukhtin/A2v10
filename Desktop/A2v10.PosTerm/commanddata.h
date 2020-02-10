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
	double _price;
	double _qty;
	double _sum;
	PosReceiptItemData()
		: _article(0), _price(0), _qty(0), _sum(0) {}
protected:
	BEGIN_JSON_PROPS(5)
		STRING_PROP(name, _name)
		INT64_PROP(article, _article)
		DOUBLE_PROP(price, _price)
		DOUBLE_PROP(qty, _qty)
		DOUBLE_PROP(sum, _sum)
	END_JSON_PROPS()
};

class PosPrintReceiptData : public JsonTarget
{
public:
	std::wstring _topText;
	__int64 _cashSum;
	__int64 _cardSum;
	JsonTargetTypedArray<PosReceiptItemData> _items;

	PosPrintReceiptData()
		: _cashSum(0), _cardSum(0) {}
protected:
	BEGIN_JSON_PROPS(4)
		STRING_PROP(topText, _topText)
		INT64_PROP(cashSum, _cashSum)
		INT64_PROP(cardSum, _cardSum)
		ARRAY_PROP(items, _items)
	END_JSON_PROPS()
};
