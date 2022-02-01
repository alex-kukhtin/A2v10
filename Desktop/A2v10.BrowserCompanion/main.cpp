// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

#ifdef _DEBUG
#define _ITERATOR_DEBUG_LEVEL 0
#endif

#include <iostream>
#include <string>

#include "../A2v10.PosTerm/posterm.h"

#pragma comment(lib,"../Lib/A2v10.PosTerm.lib")


int main(int argc, char *argv[], char *envp[])
{
	const size_t MAX_LEN = 65536;
	char* buf = new char[MAX_LEN];

	union nativeInt {
		int _len;
		unsigned char _b[4];
	} len {0};


	PosCreateMonitor();


	while (!std::cin.eof()) 
	{
		len._b[0] = std::cin.get();
		len._b[1] = std::cin.get();
		len._b[2] = std::cin.get();
		len._b[3] = std::cin.get();

		// std::cin >> len._b[0] >> len._b[1] >> len._b[2] >> len._b[3];

		if (len._len >= MAX_LEN)
		{
			std::string msg = "{\"error\":\"message too long\"}";
			len._len = msg.length();
			std::cout << len._b[0] << len._b[1] << len._b[2] << len._b[3];
			std::cout.write(msg.c_str(), len._len);
		}
		else 
		{

			std::cin.read(buf, len._len);
			buf[len._len] = '\0';

			// PosProcessMessage
			std::string result;

			if (len._len > 0)
				PosProcessCommandA(buf, result);

			len._len = result.length();

			std::cout << len._b[0] << len._b[1] << len._b[2] << len._b[3];
			std::cout.write(result.c_str(), len._len);
		}
	}
	PosShutDown();
	delete[] buf;
}
