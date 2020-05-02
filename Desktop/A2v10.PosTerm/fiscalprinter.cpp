// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "fiscalprinter.h"
#include "equipmentbase.h"
#include "fiscalprinterimpl.h"

#include "fp_Null.h"
#include "fp_DatecsBase.h"
#include "fp_Datecs3141.h"

#include "commanddata.h"

const size_t PRINTER_NAME_LEN = 64;
const wchar_t* TEST_PRINTER   = L"TESTPRINTER";
const wchar_t* DATECS_KRYPTON = L"DATECS-Krypton";
const wchar_t* FP_DATECST260  = L"DATECS-T260";

// static 
std::vector<std::unique_ptr<FiscalPrinter> > FiscalPrinter::_printers;

FiscalPrinter* FiscalPrinter::FindPrinter(const wchar_t* id)
{
	for (auto it = _printers.begin(); it != _printers.end(); ++it) {
		auto p = it->get();
		if (p->_id == id)
			return p;
	}
	return nullptr;
}

bool FiscalPrinter::Create(const wchar_t* model) {
	if (wcsncmp(model, TEST_PRINTER, PRINTER_NAME_LEN) == 0)
		_impl.reset(new CFiscalPrinter_Null());
	else if (wcsncmp(model, DATECS_KRYPTON, PRINTER_NAME_LEN) == 0)
		_impl.reset(new CFiscalPrinter_Datecs3141());
	else if (wcsncmp(model, FP_DATECST260, PRINTER_NAME_LEN) == 0)
		_impl.reset(new CFiscalPrinter_Datecs3141());
	return _impl.get() != nullptr;
}

// static 
void FiscalPrinter::Connect(const PosConnectParams& prms)
{
	auto printer = std::unique_ptr<FiscalPrinter>(new FiscalPrinter());
	if (printer->Create(prms.model)) {
		if (printer->Open(prms.port, prms.baud)) {
			FiscalPrinter* pPrinter = printer.release();
			_printers.push_back(std::unique_ptr<FiscalPrinter>(pPrinter));
			return;
		}
		throw EQUIPException(L"FP2:could_not_connect");
	}
	throw EQUIPException(L"FP1:invalid model");
}

// static 
void FiscalPrinter::ShutDown()
{
	for (auto it = _printers.begin(); it != _printers.end(); ++it) {
		auto p = it->get();
		p->Disconnect();
	}
}

bool FiscalPrinter::Open(const wchar_t* port, int baud)
{
	try 
	{
		_impl->Open(port, baud);
		if (!_impl->IsOpen())
			return false;
		_impl->Init();
		return true;
	}
	catch (EQUIPException ex) 
	{
		_impl->TraceERROR(L"Error: %s", ex.GetError());
	}
	return false;
}

void FiscalPrinter::Disconnect() {
	_impl->Close();
}

// virtual 
void FiscalPrinter::NullReceipt(bool bOpenCashDrawer)
{
	_impl->NullReceipt(bOpenCashDrawer);
}

// const 
const wchar_t* FiscalPrinter::GetLastError()
{
	if (_impl)
		return _impl->GetLastError();
	return nullptr;
}

void FiscalPrinter::OpenReceipt()
{
	_impl->OpenReceipt();
}

void FiscalPrinter::OpenReturnReceipt(long retNo)
{
	_impl->OpenReturnReceipt();
}

void FiscalPrinter::XReport()
{
	_impl->XReport();
}

void FiscalPrinter::ZReport()
{
	_impl->ZReport();
}

void FiscalPrinter::OpenCashDrawer() {
	_impl->OpenCashDrawer();
}

void FiscalPrinter::PrintFiscalText(const wchar_t* szText)
{
	_impl->PrintFiscalText(szText);
}

void FiscalPrinter::PrintNonFiscalText(const wchar_t* szText)
{
	_impl->PrintNonFiscalText(szText);
}

static void _fillReceiptItem(RECEIPT_ITEM& item, const PosReceiptItemData* pItem)
{
	item.article = pItem->_article;
	item.name = pItem->_name.c_str();
	item.unit = pItem->_unit.c_str();
	item.vat = pItem->_vat;
	item.price = pItem->_price;
	item.sum = pItem->_sum;
	item.qty = pItem->_qty;
	item.weight = pItem->_weight;
	item.discount = pItem->_dscSum;
}

void FiscalPrinter::AddArticle(const PosReceiptItemData* pItem)
{
	RECEIPT_ITEM item;
	_fillReceiptItem(item, pItem);
	_impl->AddArticle(item);
}

void FiscalPrinter::PrintItem(const PosReceiptItemData* pItem)
{
	RECEIPT_ITEM item;
	_fillReceiptItem(item, pItem);
	_impl->PrintReceiptItem(item);
}

void FiscalPrinter::PrintReceipt(const PosPrintReceiptData* pData)
{
	_impl->TraceCommand(L"PrintReceipt()");
	//_impl->CancelReceipt(); // discard previous, if needed

	for (auto it = pData->_items.begin(); it != pData->_items.end(); ++it) {
		AddArticle(it->get());
	}

	_impl->OpenReceipt();
	if (!pData->_topText.empty())
		_impl->PrintFiscalText(pData->_topText.c_str());

	__currency totalAmount;
	__currency totalDiscountSum;

	for (auto it = pData->_items.begin(); it != pData->_items.end(); ++it) {
		auto pItem = it->get();
		totalAmount += pItem->_sum;
		totalDiscountSum += pItem->_dscSum;
		PrintItem(pItem);
	}
	
	if (pData->_cardSum)
		_impl->Payment(PAYMENT_MODE::_pay_card, pData->_cardSum);
	else if (pData->_cashSum)
		_impl->Payment(PAYMENT_MODE::_pay_cash, pData->_cashSum);

	_impl->CloseReceipt();
	/*
	validate amounts

	if (pData->_cardSum != 0)
		_impl->Payment(payment_mode::card, pData->_cardSum);
	if (pData->_cashSum != 0)
		_impl->Payment(payment_mode::sum)

	long chNo = _impl.CloseCheck();
	*/

	// Close Check
}


SERVICE_SUM_INFO FiscalPrinter::ServiceInOut(bool bOut, __currency amount, bool bOpenCashDrawer)
{
	if (bOut)
		return _impl->ServiceInOut(-((long) amount), bOpenCashDrawer);
	else
		return _impl->ServiceInOut(amount, bOpenCashDrawer);
}
