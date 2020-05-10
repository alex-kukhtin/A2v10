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
	std::wstring _terminal;
protected:
	BEGIN_JSON_PROPS(4)
		STRING_PROP(port, _port)
		STRING_PROP(model, _model)
		INT_PROP(baud, _baud)
		STRING_PROP(terminal, _terminal)
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
	__currency _excise;
	__currency _price;
	int _qty;
	__currency _weight;
	__currency _sum;
	__currency _discount;
	PosReceiptItemData()
		: _article(0), _qty(0) {}
protected:
	BEGIN_JSON_PROPS(10)
		STRING_PROP(name, _name)
		STRING_PROP(unit, _unit)
		INT64_PROP(article, _article)
		CURRENCY_PROP(price, _price)
		INT_PROP(qty, _qty)
		CURRENCY_PROP(weight, _weight)
		CURRENCY_PROP(sum, _sum)
		CURRENCY_PROP(discount, _discount)
		CURRENCY_PROP(vat, _vat)
		CURRENCY_PROP(excise, _excise)
	END_JSON_PROPS()
};

class PosPrintReceiptData : public JsonTarget
{
public:
	std::wstring _topText;
	__currency _cashSum;
	__currency _cardSum;
	__currency _sum;
	JsonTargetTypedArray<PosReceiptItemData> _items;

	PosPrintReceiptData() {}
protected:
	BEGIN_JSON_PROPS(5)
		STRING_PROP(topText, _topText)
		CURRENCY_PROP(cashSum, _cashSum)
		CURRENCY_PROP(cardSum, _cardSum)
		CURRENCY_PROP(sum, _sum)
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

class PosPeriodReportData : public JsonTarget
{
public:
	std::wstring _report;
	bool _short;
	std::wstring _from;
	std::wstring _to;

	PosPeriodReportData()
		: _short(false) {}
protected:
	BEGIN_JSON_PROPS(4)
		STRING_PROP(report, _report)
		BOOL_PROP(@short, _short)
		STRING_PROP(from, _from)
		STRING_PROP(to, _to)
	END_JSON_PROPS()
};
