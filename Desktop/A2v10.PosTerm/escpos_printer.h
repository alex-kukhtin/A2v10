#pragma once

class EscPos_Printer
{
	std::wstring _printerName;
	std::vector<byte> _buffer;
	int _lineLength;
public:
	//0x08 - emphasize, 0x10 - doubleheight, 0x20 - double width, 0x80 - underline
	enum PrintMode {
		Normal = 0x00,
		Bold = 0x08,
		DoubleHeight = 0x10,
		DoubleWidth = 0x20,
		Underline = 0x80,
	};

	enum Align {
		Left = 0,
		Right = 1,
		Center = 2
	};

	enum LineType {
		Single = 0xc4,
		Double = 0xcd
	};

	EscPos_Printer(const wchar_t* printerName, int lineLen);

	int LineLength() { return _lineLength; }
	void Start();
	void AppendLine(const wchar_t* text, Align align = Align::Left, int mode = 0);
	void AppendLine();
	void AppendGraphLine(LineType mode);
	void Cut();
	bool Print();
private:
	std::string To866(const wchar_t* text);
};