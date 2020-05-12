#pragma once

union __currency {
	struct {
		unsigned long lo;
		long hi;
	};
	__int64 int64 = 0;

	__currency() {
		int64 = 0;
	}
	__currency(__int64 v) {
		int64 = v;
	}

	__currency& operator=(long v);
	__currency& operator+=(const __currency v1);
	operator long() const;
	operator bool() const;

	long units() const;
	__currency negate() const;
	std::wstring to_wstring() const;
	static __currency from_units(long units);
	static __currency from_units(long c, long f);
	static __currency from_string(const std::string& units);
};

__currency operator +(const __currency& v1, const __currency& v2);
