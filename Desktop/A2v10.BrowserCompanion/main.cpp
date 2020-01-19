// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

#include <iostream>

int main(int argc, char *argv[], char *envp[])
{
	const size_t MAX_LEN = 65536;
	char buf[MAX_LEN];

	union nativeInt {
		int _len;
		unsigned char _b[4];
	} len;


	while (!std::cin.eof()) {
		std::cin >> len._b[0] >> len._b[1] >> len._b[2] >> len._b[3];

		if (len._len >= MAX_LEN)
		{
			const char* msg = "{\"error\":\"message too long\"}";
		}
		else 
		{

			for (int i = 0; i < len._len; i++) {
				std::cin >> buf[i];
			}

			buf[len._len] = '\0';

			// process message
			len._len = strnlen_s(buf, MAX_LEN);

			std::cout << len._b[0] << len._b[1] << len._b[2] << len._b[3];
			for (int i = 0; i < len._len; i++) {
				std::cout << buf[i];
			}
		}
	}
}
