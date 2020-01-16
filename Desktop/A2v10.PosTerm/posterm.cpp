// A2v10.PosTerm.cpp : Defines the functions for the static library.
//

#include "pch.h"
#include "framework.h"
#include "posterm.h"

#pragma comment(lib,"../Lib/A2v10.StaticBase.lib")

pos_result_t PosProcessCommand(const wchar_t* json, std::wstring& result)
{
	JsonParser parser;
	try 
	{
		result.assign(json);
		//parser.Parse(json);
	}
	catch (JsonException ex) {
		result.assign(ex.GetMessage());
		return pos_result_t::_invalid_json;
	}
	return pos_result_t::_success;
}
