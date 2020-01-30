
#include "pch.h"
#include "jsonparser.h"


#define MAX_PROP_LENGTH 64
#define NULL_CHR L'\0'

long _string2Long(const wchar_t* szString)
{
	if (!szString || !*szString)
		return 0;
	return _wtol(szString);
}

__int64 _string2Int64(const wchar_t* szString)
{
	if (!szString || !*szString)
		return 0;
	return _wtoi64(szString);
}

enum TokenId {
	End,
	Equal,
	Colon,
	Comma,
	OpenParen, // (
	CloseParen, // )
	OpenBracket, // ]
	CloseBracket, // ]
	OpenCurly, // {
	CloseCurly, // }
	StringLiteral,
	NumberLiteral,
	TrueLiteral,
	FalseLiteral,
	Identifier
};

class JsonToken
{
public:
	TokenId _tok;
	std::wstring _value;
	JsonToken() : _tok(TokenId::End) {}
	void Clear();
	void CheckIder();

};

class JsonScaner
{
	const wchar_t* _text;
	wchar_t _ch;
	int _pos;
	int _len;
	JsonToken _token;
public:
	JsonScaner(const wchar_t* szText = nullptr);
	void SetText(const wchar_t* szText);
	void NextToken();
	inline bool IsEOF() { return _pos >= _len; }
	const JsonToken& CurrentToken() { return _token; }
private:
	void NextChar();
	void AppendChar(wchar_t ch);
};

// JsonToken
////////////////

void JsonToken::Clear()
{
	_tok = TokenId::End;
	_value.clear();
}

void JsonToken::CheckIder()
{
	if (_value == L"true") {
		_tok = TokenId::TrueLiteral;
		_value.clear();
	}
	else if (_value == L"false") {
		_tok = TokenId::FalseLiteral;
		_value.clear();
	}
}

// JSonScaner
////////////////////////

JsonScaner::JsonScaner(const wchar_t* szText)
	: _text(szText), _pos(0), _ch(NULL_CHR), _len(0)
{
	SetText(szText);
}

void JsonScaner::SetText(const wchar_t* szText)
{
	_text = szText;
	_pos = 0;
	_ch = NULL_CHR;
	if (szText) {
		_len = wcslen(szText);
		_ch = _pos < _len ? _text[_pos] : '\0';
	}
}

void JsonScaner::NextChar()
{
	if (_pos < _len) _pos++;
	_ch = _pos < _len ? _text[_pos] : NULL_CHR;
}

void JsonScaner::AppendChar(wchar_t ch)
{
	_token._value += ch;
}

void JsonScaner::NextToken()
{
	_token.Clear();
	while (iswspace(_ch))
		NextChar();
	switch (_ch) {
	case L'{':
		NextChar();
		_token._tok = TokenId::OpenCurly;
		break;
	case L'}':
		NextChar();
		_token._tok = TokenId::CloseCurly;
		break;
	case L'[':
		NextChar();
		_token._tok = TokenId::OpenBracket;
		break;
	case L']':
		NextChar();
		_token._tok = TokenId::CloseBracket;
		break;
	case L':':
		NextChar();
		_token._tok = TokenId::Colon;
		break;
	case L',':
		NextChar();
		_token._tok = TokenId::Comma;
		break;
	case L'=':
		NextChar();
		_token._tok = TokenId::Equal;
		break;
	case L'"':
		_token._tok = TokenId::StringLiteral;
		NextChar();
		while (_pos < _len) {
			if (_ch == L'"') {
				NextChar();
				break;
			}
			if (_ch == L'\\') {
				NextChar();
			}
			AppendChar(_ch);
			NextChar();
		}
		break;
	default:
		if (iswdigit(_ch) || _ch == '+' || _ch == '-') {
			// digit
			_token._tok = TokenId::NumberLiteral;
			AppendChar(_ch);
			NextChar();
			while (iswdigit(_ch) || _ch == L'.') {
				AppendChar(_ch);
				NextChar();
			}
		}
		else if (iswalpha(_ch)) {
			// ider
			_token._tok = TokenId::Identifier;
			while (iswalnum(_ch) || _ch == '_' || _ch == '$') {
				AppendChar(_ch);
				NextChar();
			}
			_token.CheckIder();
		}
		else
			NextChar();
	}
}

// JsonParser
////////////////////

JsonParser::JsonParser()
{
	_scan = new JsonScaner();
}

// virtual 
JsonParser::~JsonParser()
{
	delete _scan;
}

void JsonParser::SetTarget(JsonTarget* pTarget)
{
	_target = pTarget;
}

void JsonParser::Parse(const wchar_t* szText)
{
	if (_target == nullptr)
		throw JsonException(L"Invalid target value. Forgot 'SetTarget'?");
	_scan->SetText(szText);
	const JsonToken& ct = _scan->CurrentToken();
	_scan->NextToken();
	while (!_scan->IsEOF()) {
		if (ct._tok == TokenId::OpenCurly) {
			_scan->NextToken();
			ParseObject(_target);
		}
		else if (ct._tok == TokenId::OpenBracket) {
			_scan->NextToken();
			ParseArray(_target, nullptr);
		}
		_scan->NextToken();
	}
}

void JsonParser::ParseArray(JsonTarget* target, const wchar_t* szName)
{
	const JsonToken& ct = _scan->CurrentToken();
	while (!_scan->IsEOF() && ct._tok != TokenId::CloseBracket) {
		if (ct._tok == TokenId::OpenCurly) {
			auto newTarget = target ? target->CreateObject(szName) : nullptr;
			_scan->NextToken();
			ParseObject(newTarget);
		}
		else if (ct._tok == TokenId::Comma)
		{
			_scan->NextToken();
		}
		else {
			SetValue(target, nullptr);
		}
	}
}

void JsonParser::ParseObject(JsonTarget* target)
{
	const JsonToken& ct = _scan->CurrentToken();
	std::wstring name;
	while (!_scan->IsEOF()) {
		switch (ct._tok) {
		case TokenId::CloseCurly:
			_scan->NextToken();
			return;
		case TokenId::Comma:
			_scan->NextToken();
			continue;
		case TokenId::StringLiteral:
		case TokenId::Identifier:
			name = ct._value;
			_scan->NextToken();
			if (ct._tok != TokenId::Colon)
				throw JsonException(L"Lxpected ':'");
			_scan->NextToken();
			switch (ct._tok) {
			case TokenId::OpenCurly:
			{
				JsonTarget* newTarget = target->CreateObject(name.c_str());
				_scan->NextToken();
				ParseObject(newTarget);
				break;
			}
			case TokenId::OpenBracket:
			{
				JsonTarget* newTarget = target->CreateArray(name.c_str());
				ParseArray(newTarget, name.c_str());
			}
			default:
				SetValue(target, name.c_str());
			}
		}
	}
}

void JsonParser::SetValue(JsonTarget* target, const wchar_t* szName)
{
	if (!target) {
		_scan->NextToken();
		return;
	}
	const JsonToken& ct = _scan->CurrentToken();
	if (ct._tok == TokenId::StringLiteral) {
		target->SetStringValue(szName, ct._value.c_str());
	}
	else if (ct._tok == TokenId::NumberLiteral) {
		target->SetNumberValue(szName, ct._value.c_str());
	}
	else if (ct._tok == TokenId::TrueLiteral) {
		target->SetBoolValue(szName, true);
	}
	else if (ct._tok == TokenId::FalseLiteral) {
		target->SetBoolValue(szName, false);
	}
	_scan->NextToken();
}


// virtual 
void JsonTarget::SetStringValue(const wchar_t* szName, const wchar_t* szValue)
{
	PROP_ENTRY* props = __getPropsTable();
	if (!props)
		return;
	while (props && props->name) {
		if (props->pString && wcsncmp(props->name, szName, MAX_PROP_LENGTH) == 0) {
			props->pString->assign(szValue);
			return;
		}
		props++;
	}
}

////////////////
// JsonTarget
JsonTarget::~JsonTarget()
{

}

// virtual 
void JsonTarget::SetNumberValue(const wchar_t* szName, const wchar_t* szValue)
{
	PROP_ENTRY* props = __getPropsTable();
	if (!props)
		return;
	while (props && props->name) {
		if (wcsncmp(props->name, szName, MAX_PROP_LENGTH) == 0) {
			if (props->pInt)
				*props->pInt = _string2Long(szValue);
			else if (props->pInt64)
				*props->pInt64 = _string2Int64(szValue);
			return;
		}
		props++;
	}
}

// virtual 
void JsonTarget::SetBoolValue(const wchar_t* szName, bool bValue)
{
	PROP_ENTRY* props = __getPropsTable();
	if (!props)
		return;
	while (props && props->name) {
		if (props->pBool && wcsncmp(props->name, szName, MAX_PROP_LENGTH) == 0) {
			*props->pBool = bValue;
			return;
		}
		props++;
	}
}

//virtual 
JsonTarget* JsonTarget::CreateArray(const wchar_t* szName)
{
	PROP_ENTRY* props = __getPropsTable();
	if (!props)
		return nullptr;
	while (props && props->name) {
		if (props->pArray && wcsncmp(props->name, szName, MAX_PROP_LENGTH) == 0) {
			return props->pArray;
		}
		props++;
	}
	return nullptr;
}

