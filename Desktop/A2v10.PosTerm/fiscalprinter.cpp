// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "fiscalprinter.h"
#include "fiscalprinterimpl.h"

#include "fp_Null.h"
#include "fp_DatecsBase.h"
#include "fp_Datecs3141.h"

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

void FiscalPrinter::Create(const wchar_t* model) {
	_impl.reset(new CFiscalPrinter_Null());
}
