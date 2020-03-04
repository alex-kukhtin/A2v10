// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

#include "pch.h"
#include "posterm.h"
#include "equipmentbase.h"
#include "acqterminalimpl.h"
#include "acqt_Printec.h"
#include "stringtools.h"

/* dynamic */
#include "Vendor/Printec_1_23/posapi.h"
#pragma comment(lib,"../A2v10.PosTerm/Vendor/Printec_1_23/posapi.lib")

/* static */
//#include "Vendor/Printec_1_23/pos.h"
//#pragma comment(lib,"../A2v10.PosTerm/Vendor/Printec_1_23/pos.lib")

const char* CURRENCY_CODE = "980";
const int TIMEOUT = 30000; // ms

enum AcqResult {
	EQ_ERROR,
	EQ_CONFIRM,
	EQ_DECLINE,
	EQ_BREAK
};

class AcqTerminal_PrintecImpl
{
	std::string _port;
	std::string _log;
	AcqResult _result;
	std::wstring _errorMessage;
	IAcqTerminalDriver& _driver;

public:
	AcqTerminal_PrintecImpl(IAcqTerminalDriver& driver, const char* port, const char* log)
		: _driver(driver), _port(port), _log(log), _result(AcqResult::EQ_ERROR) {}
	virtual ~AcqTerminal_PrintecImpl() {}

	AcqResult payment(long amount);
	const wchar_t* errorMessage() { return _errorMessage.c_str(); }
private:
	AcqResult read_response(POS_HANDLE handle);
	void parse_response(POS_HANDLE handle, int response);
	bool check_error(bool code, const wchar_t* error);
};

// virtual 
AcqResult AcqTerminal_PrintecImpl::payment(long amount)
{
	POS_HANDLE handle;
	bool rc = pos_open(&handle, _port.c_str(), _log.c_str());
	if (check_error(rc, L"port not open"))
		return AcqResult::EQ_ERROR;

	rc = pos_set(handle, POS_AMOUNT, std::to_string(amount).c_str());
	if (check_error(rc, L"set amount failed"))
		return AcqResult::EQ_ERROR;

	rc = pos_set(handle, POS_CURRENCY, CURRENCY_CODE);
	if (check_error(rc, L"set currency failed"))
		return AcqResult::EQ_ERROR;

	rc = pos_send(handle, ACTION_PAYMENT);
	if (check_error(rc, L"send failed"))
		return AcqResult::EQ_ERROR;

	return read_response(handle);
}

bool AcqTerminal_PrintecImpl::check_error(bool code, const wchar_t* error)
{
	if (code)
		return false;
	_errorMessage = error;
	return true;
}

AcqResult AcqTerminal_PrintecImpl::read_response(POS_HANDLE handle)
{
	int response;
	do {
		response = pos_receive(handle, TIMEOUT);
		if (response && response != RESP_TIMEOUT) {
			parse_response(handle, response);
		}
		else if (!response) {
			check_error(true, L"response is zero");
			return AcqResult::EQ_ERROR;
		}

	} while (response == RESP_MESSAGE || response == RESP_TIMEOUT || response == RESP_IDENTIFIER);

	if (response == RESP_BREAK)
		_result = AcqResult::EQ_BREAK;
	else if (response == RESP_CONFIRM)
		_result = AcqResult::EQ_CONFIRM;
	else if (response == RESP_DECLINE)
		_result = AcqResult::EQ_DECLINE;
	pos_close(&handle);
	return _result;
}

void AcqTerminal_PrintecImpl::parse_response(POS_HANDLE handle, int response)
{
	char par[32];

	int len = pos_get_max_length(handle) + 1;

	char* val = new char[len + 1];
	bool ident = false;
	bool msg = false;

	if (response == RESP_CONFIRM)
		_result = AcqResult::EQ_CONFIRM;
	else if (response == RESP_DECLINE)
		_result = AcqResult::EQ_CONFIRM;
	else if (response == RESP_IDENTIFIER)
		ident = true;
	else if (response == RESP_MESSAGE)
		msg = true;

	if (pos_get_first(handle, par, sizeof(par), val, len + 1))
	{
		do {
			std::wstring wpar = A2W(par);
			std::wstring wval = A2W(val);
			if (ident)
				_driver.Identifier(wpar.c_str(), wval.c_str());
			else if (msg)
				_driver.Message(wpar.c_str(), wval.c_str());
			else
				_driver.Response(wpar.c_str(), wval.c_str());
		} while (pos_get_next(handle, par, sizeof(par), val, len + 1));
	}

	delete[] val;
}


// virtual 
void AcqTerminal_Printec::Open(const wchar_t* port, const wchar_t* log)
{
	TraceINFO(L"PRINTEC [%s]. Open({port:'%s', log:'%s'})", _id.c_str(), port, log);
	_impl.reset(new AcqTerminal_PrintecImpl(*this, W2A(port).c_str(), W2A(log).c_str()));
}

static void addResult(JsonObject& resp, AcqResult rc)
{
	const wchar_t* r = L"error";
	switch (rc) {
	case AcqResult::EQ_CONFIRM:
		r = L"confirm";
		break;
	case AcqResult::EQ_DECLINE:
		r = L"decline";
		break;
	case AcqResult::EQ_BREAK:
		r = L"break";
		break;
	}
	resp.Add(L"result", r); // action result
}

// virtual 
bool AcqTerminal_Printec::Payment(long amount)
{
	TraceINFO(L"PRINTEC [%s]. Payment({amount:'%ld'})", _id.c_str(), amount);
	AcqResult rc = _impl->payment(amount);
	addResult(_response, rc);
	if (rc == AcqResult::EQ_ERROR)
		_response.Add(L"error_message", _impl->errorMessage());
	TraceINFO(L"\t Response:(%s)", _response.ToString().c_str());
	return true;

}


// virtual 
void AcqTerminal_Printec::Response(const wchar_t* name, const wchar_t* value)
{
	_response.Add(name, value);
}

// virtual 
void AcqTerminal_Printec::Message(const wchar_t* name, const wchar_t* value) {

}

// virtual 
void AcqTerminal_Printec::Identifier(const wchar_t* name, const wchar_t* value)
{
}

void AcqPrintecImplDeleter::operator()(AcqTerminal_PrintecImpl* pImpl)
{
	delete pImpl;
}

