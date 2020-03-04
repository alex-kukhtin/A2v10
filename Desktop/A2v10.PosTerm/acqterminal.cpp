
// Copyright © 2017-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "acqterminal.h"

#include "equipmentbase.h"
#include "acqterminalimpl.h"

#include "acqt_Null.h"
#include "acqt_Printec.h"

std::vector<std::unique_ptr<AcqTerminal>> AcqTerminal::_terminals;

const size_t TERMINAL_NAME_LEN = 64;
const wchar_t* TEST_TERMINAL = L"TESTACQUIRING";
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
		_impl.reset(new AcqTerminal_Printec());
	return _impl.get() != nullptr;
}

// static 
pos_result_t AcqTerminal::Connect(const wchar_t* model, const wchar_t* port, const wchar_t* log)
{
	auto terminal = std::unique_ptr<AcqTerminal>(new AcqTerminal());
	if (terminal->Create(model)) {
		if (terminal->Open(port, log)) {
			AcqTerminal* pTerminal = terminal.release();
			_terminals.push_back(std::unique_ptr<AcqTerminal>(pTerminal));
			return pos_result_t::_success;
		}
		return pos_result_t::_could_not_connect;
	}
	return pos_result_t::_invalid_model;
}

// static 
void AcqTerminal::ShutDown()
{
	for (auto it = _terminals.begin(); it != _terminals.end(); ++it) {
		auto t = it->get();
		t->Disconnect();
	}
}

bool AcqTerminal::Open(const wchar_t* port, const wchar_t* log)
{
	try
	{
		_impl->Open(port, log);
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

void AcqTerminal::Disconnect()
{
	_impl->Close();
}

bool AcqTerminal::Payment(long amount) 
{
	return _impl->Payment(amount);
}
