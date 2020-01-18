// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "fiscalprinter.h"
#include "fiscalprinterimpl.h"

#include "fp_Null.h"
#include "fp_DatecsBase.h"
#include "fp_Datecs3141.h"

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
pos_result_t FiscalPrinter::Connect(const wchar_t* model, const wchar_t* port, int baud)
{
	auto printer = std::unique_ptr<FiscalPrinter>(new FiscalPrinter());
	if (printer->Create(model)) {
		if (printer->Open(port, baud)) {
			FiscalPrinter* pPrinter = printer.release();
			_printers.push_back(std::unique_ptr<FiscalPrinter>(pPrinter));
			return pos_result_t::_success;
		}
		return pos_result_t::_not_connected;
	}
	return pos_result_t::_invalid_model;
}

bool FiscalPrinter::Open(const wchar_t* port, int baud)
{
	if (_impl)
		return _impl->Open(port, baud);
	return false;
}

// virtual 
void FiscalPrinter::NullReceipt(bool bOpenCashDrawer)
{
	if (_impl)
		_impl->NullReceipt(bOpenCashDrawer);
}

// const 
const wchar_t* FiscalPrinter::GetLastError()
{
	if (_impl)
		return _impl->GetLastError();
	return nullptr;
}

void FiscalPrinter::XReport()
{
	if (_impl)
	_impl->XReport();
}

void FiscalPrinter::ZReport()
{
	if (_impl)
		_impl->ZReport();
}
