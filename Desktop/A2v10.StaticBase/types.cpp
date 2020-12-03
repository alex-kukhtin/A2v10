
#include "pch.h"
#include "types.h"
#include "jsonparser.h"
#include "strings.h"

__currency& __currency::operator=(long v)
{
	int64 = v;
	return *this;
}

__currency& __currency::operator+=(const __currency v1)
{
	int64 += v1.int64;
	return *this;
}

__currency::operator long() const
{
	return (long) int64 / 100;
}

__currency::operator bool() const
{
	return int64 != 0;
}

__currency operator +(const __currency& v1, const __currency& v2) {
	return __currency(v1.int64 + v2.int64);
}

long __currency::units() const
{
	return (long) (int64 / 100);
}

std::wstring __currency::to_wstring() const
{
	long units = this->units();
	wchar_t sign[2];
	sign[0] = 0;
	sign[1] = 0;
	if (units < 0) {
		units = -units;
		sign[0] = L'-';
	}
	long c = units / 100;
	long f = units % 100;
	wchar_t buf[255];
	swprintf_s(buf, 255, L"%s%ld.%02ld", sign, c, f);
	return std::wstring(buf);
}

std::wstring __currency::to_wstring3digit() const
{
	long units = (long) this->int64 / 10;
	wchar_t sign[2];
	sign[0] = 0;
	sign[1] = 0;
	if (units < 0) {
		units = -units;
		sign[0] = L'-';
	}
	long c = units / 1000;
	long f = units % 1000;
	wchar_t buf[255];
	swprintf_s(buf, 255, L"%s%ld.%03ld", sign, c, f);
	return std::wstring(buf);
}

//static 
__currency __currency::from_units(long units)
{
	return __currency(units * 100);
}

//static 
__currency __currency::from_units(long c, long f)
{
	if (c < 0)
		return __currency(-(-c * 100 + f) * 100);
	else
		return __currency((c * 100 + f) * 100);
}


__currency __currency::from_string(const std::string& units)
{
	auto vals = _split(units, '.');
	if (vals.size() == 2) {
		long c = atol(vals[0].c_str());
		long f = atol(vals[1].c_str());
		return __currency::from_units(c, f);
	}
	else if (vals.size() == 1) {
		long c = atol(vals[0].c_str());
		return __currency::from_units(c, 0);
	}
	throw 1;
}
