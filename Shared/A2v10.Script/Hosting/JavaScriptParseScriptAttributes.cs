namespace ChakraHost.Hosting
{
    using System;

	/// <summary>
	///     Attribute mask for JsParseScriptWithAttributes
	/// </summary>
	[Flags]
    public enum JsParseScriptAttributes
	{
		/// <summary>
		///     Default attribute
		/// </summary>
		JsParseScriptAttributeNone = 0x0,
		/// <summary>
		///     Specified script is internal and non-user code. Hidden from debugger
		/// </summary>
		JsParseScriptAttributeLibraryCode = 0x1,
		/// <summary>
		///     ChakraCore assumes ExternalArrayBuffer is Utf8 by default.
		///     This one needs to be set for Utf16
		/// </summary>
		JsParseScriptAttributeArrayBufferIsUtf16Encoded = 0x2,
	}
}
