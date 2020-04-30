// Copyright © 2020 Alex Kukhtin. All rights reserved.

#pragma once

class PosConnectData : public JsonTarget
{
public:
	PosConnectData()
		: _baud(0) {}
	std::wstring _port;
	std::wstring _model;
	int _baud;
protected:
	BEGIN_JSON_PROPS(3)
		STRING_PROP(port, _port)
		STRING_PROP(model, _model)
		INT_PROP(baud, _baud)
	END_JSON_PROPS()
};

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
	std::wstring _unit;
	__int64 _article;
	__currency _vat;
	__currency _price;
	int _qty;
	__currency _weight;
	__currency _sum;
	__currency _dscSum;
	PosReceiptItemData()
		: _article(0), _qty(0) {}
protected:
	BEGIN_JSON_PROPS(9)
		STRING_PROP(name, _name)
		STRING_PROP(unit, _unit)
		INT64_PROP(article, _article)
		CURRENCY_PROP(price, _price)
		INT_PROP(qty, _qty)
		CURRENCY_PROP(weight, _weight)
		CURRENCY_PROP(sum, _sum)
		CURRENCY_PROP(dscSum, _dscSum)
		CURRENCY_PROP(vat, _vat)
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

class PosAcquirePaymentData : public JsonTarget
{
public:
	__currency _amount;
protected:
	BEGIN_JSON_PROPS(1)
		CURRENCY_PROP(amount, _amount)
	END_JSON_PROPS()
};

class PosServiceInOutData : public JsonTarget
{
public:
	bool _out;
	bool _openCashDrawer;
	__currency _amount;

	PosServiceInOutData()
		: _out(false), _openCashDrawer(false) {}
protected:
	BEGIN_JSON_PROPS(3)
		CURRENCY_PROP(amount, _amount)
		BOOL_PROP(out, _out)
		BOOL_PROP(openCashDrawer, _openCashDrawer)
	END_JSON_PROPS()
};
