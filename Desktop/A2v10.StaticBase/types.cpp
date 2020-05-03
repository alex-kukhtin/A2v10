
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
	long c = units / 100;
	long f = units % 100;
	std::wstring result = std::to_wstring(c);
	if (f != 0)
		result.append(L".").append(std::to_wstring(f));
	return result;
}

//static 
__currency __currency::from_units(long units)
{
	return __currency(units * 100);
}

__currency __currency::from_string(const std::string& units)
{
	auto vals = _split(units, '.');
	if (vals.size() == 2) {
		long c = atol(vals[0].c_str());
		long f = atol(vals[1].c_str());
		return __currency::from_units(c * 100 + f);
	}
	else if (vals.size() == 1) {
		long c = atol(vals[0].c_str());
		return __currency::from_units(c * 100);
	}
	throw 1;
}
