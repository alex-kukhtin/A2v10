// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "fiscalprinter.h"
#include "equipmentbase.h"
#include "fiscalprinterimpl.h"

#include "fp_Null.h"
#include "fp_DatecsBase.h"
#include "fp_DatecsKrypton.h"

#include "commanddata.h"
#include "errors.h"

const size_t PRINTER_NAME_LEN = 64;
const wchar_t* TEST_PRINTER   = L"TESTPRINTER";
const wchar_t* NO_PRINTER     = L"NOPRINTER";
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
	else if (wcsncmp(model, NO_PRINTER, PRINTER_NAME_LEN) == 0)
		_impl.reset(new CFiscalPrinter_Null());
	else if (wcsncmp(model, DATECS_KRYPTON, PRINTER_NAME_LEN) == 0)
		_impl.reset(new CFiscalPrinter_DatecsKrypton(model));
	else if (wcsncmp(model, FP_DATECST260, PRINTER_NAME_LEN) == 0)
		_impl.reset(new CFiscalPrinter_DatecsKrypton(model));
	return _impl.get() != nullptr;
}

// static 
FiscalPrinter* FiscalPrinter::Connect(const PosConnectParams& prms)
{
	auto printer = std::unique_ptr<FiscalPrinter>(new FiscalPrinter());
	if (printer->Create(prms.model)) {
		if (printer->Open(prms.port, prms.baud)) {
			printer->SetParams(prms);
			FiscalPrinter* pPrinter = printer.release();
			_printers.push_back(std::unique_ptr<FiscalPrinter>(pPrinter));
			return pPrinter;
		}
		throw EQUIPException(FP_E_UNABLE_TO_CONNECT);
	}
	throw EQUIPException(FP_E_INVALID_FP_MODEL);
}

// static 
void FiscalPrinter::ShutDown()
{
	for (auto it = _printers.begin(); it != _printers.end(); ++it) {
		auto p = it->get();
		p->Disconnect();
	}
}

void FiscalPrinter::SetParams(const PosConnectParams& prms)
{
	_impl->SetParams(prms);
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
long FiscalPrinter::NullReceipt(bool bOpenCashDrawer)
{
	return _impl->NullReceipt(bOpenCashDrawer);
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

void FiscalPrinter::OpenReturnReceipt()
{
	_impl->OpenReturnReceipt();
}

long FiscalPrinter::XReport()
{
	return _impl->XReport();
}

ZREPORT_RESULT FiscalPrinter::ZReport()
{
	return _impl->ZReport();
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
	item.excise = pItem->_excise;
	item.price = pItem->_price;
	item.sum = pItem->_sum;
	item.qty = pItem->_qty;
	item.weight = pItem->_weight;
	item.discount = pItem->_discount;
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

long FiscalPrinter::PrintReceipt(const PosPrintReceiptData* pData)
{
	_impl->TraceCommand(L"PrintReceipt()");
	_impl->CancelReceipt(); // discard previous, if needed

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
		totalDiscountSum += pItem->_discount;
		PrintItem(pItem);
	}

	_impl->PrintTotal();

	if (pData->_cardSum)
		_impl->Payment(PAYMENT_MODE::_pay_card, pData->_cardSum);
	else if (pData->_cashSum)
		_impl->Payment(PAYMENT_MODE::_pay_cash, pData->_cashSum);

	// Close receipt
	return _impl->CloseReceipt(true);
}


long FiscalPrinter::PrintReturnReceipt(const PosPrintReceiptData* pData)
{
	_impl->TraceCommand(L"PrintReturnReceipt()");
	_impl->CancelReceipt(); // discard previous, if needed

	for (auto it = pData->_items.begin(); it != pData->_items.end(); ++it) {
		AddArticle(it->get());
	}

	_impl->OpenReturnReceipt();
	if (!pData->_topText.empty())
		_impl->PrintFiscalText(pData->_topText.c_str());

	__currency totalAmount;
	__currency totalDiscountSum;

	for (auto it = pData->_items.begin(); it != pData->_items.end(); ++it) {
		auto pItem = it->get();
		totalAmount += pItem->_sum;
		totalDiscountSum += pItem->_discount;
		PrintItem(pItem);
	}

	_impl->PrintTotal();

	if (pData->_cardSum)
		_impl->Payment(PAYMENT_MODE::_pay_card, pData->_cardSum);
	else if (pData->_cashSum)
		_impl->Payment(PAYMENT_MODE::_pay_cash, pData->_cashSum);

	// Close receipt
	return _impl->CloseReceipt(true);
}

SERVICE_SUM_INFO FiscalPrinter::ServiceInOut(bool bOut, __currency amount, bool bOpenCashDrawer)
{
	return _impl->ServiceInOut(bOut, amount, bOpenCashDrawer);
}

long FiscalPrinter::PeriodReport(const wchar_t* report, bool bShort, const wchar_t* from, const wchar_t* to)
{
	return _impl->PeriodReport(report, bShort, from, to);
}

// virtual 
JsonObject  FiscalPrinter::FillZReportInfo()
{
	return _impl->FillZReportInfo();
}

void FiscalPrinter::AddMessages(JsonObject& json)
{
	std::vector<std::wstring> msgs;
	_impl->GetStatusMessages(msgs);
	if (msgs.size() <= 0)
		return;

	JsonObject status;
	for (auto it = msgs.begin(); it != msgs.end(); ++it)
		status.AddArray(it->c_str());
	json.AddArray(L"messages", &status);
}

void FiscalPrinter::ReadErrorCode()
{
	_impl->GetErrorCode();
}

void FiscalPrinter::GetInfo(JsonObject& json)
{
	_impl->GetPrinterInfo(json);
}

long FiscalPrinter::CopyReceipt()
{
	return _impl->CopyReceipt();
}
