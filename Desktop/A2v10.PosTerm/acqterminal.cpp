
// Copyright © 2017-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "acqterminal.h"

#include "acqterminalimpl.h"

#include "acqt_Null.h"
//#include "acqt_Printec.h"

std::vector<std::unique_ptr<AcqTerminal>> AcqTerminal::_terminals;

const size_t TERMINAL_NAME_LEN = 64;
const wchar_t* TEST_TERMINAL = L"TESTPRINTER";
const wchar_t* ACQ_PRINTEC_31 = L"PRINTEC-3.1";


AcqTerminal* AcqTerminal::FindTerminal(const wchar_t* id)
{
	for (auto it = _terminals.begin(); it != _terminals.end(); ++it) {
		auto p = it->get();
		if (p->_id == id)
			return p;
	}
	return nullptr;
}

bool AcqTerminal::Create(const wchar_t* model) {
	if (wcsncmp(model, TEST_TERMINAL, TERMINAL_NAME_LEN) == 0)
		_impl.reset(new AcqTerminal_Null());
	else if (wcsncmp(model, ACQ_PRINTEC_31, TERMINAL_NAME_LEN) == 0)
		;// _impl.reset(new CFiscalPrinter_Datecs3141());
	return _impl.get() != nullptr;
}

// static 
void AcqTerminal::ShutDown()
{
	for (auto it = _terminals.begin(); it != _terminals.end(); ++it) {
		auto t = it->get();
		t->Disconnect();
	}
}

void AcqTerminal::Disconnect()
{
	_impl->Close();
}
