
// Copyright © 2017-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "acqterminal.h"

#include "acqterminalimpl.h"

//#include "acqt_Null.h"
//#include "acqt_Printec.h"

std::vector<std::unique_ptr<AcqTerminal>> AcqTerminal::_terminals;

AcqTerminal* AcqTerminal::FindTerminal(const wchar_t* id)
{
	for (auto it = _terminals.begin(); it != _terminals.end(); ++it) {
		auto p = it->get();
		if (p->_id == id)
			return p;
	}
	return nullptr;
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
