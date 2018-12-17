namespace ChakraHost.Hosting
{
	using System;
	using System.Diagnostics.CodeAnalysis;
	using System.Runtime.InteropServices;

	/// <summary>
	///     Native interfaces.
	/// </summary>
	public static partial class NativeMethods
	{
		[DllImport(DllName)]
		internal static extern JavaScriptErrorCode JsDiagStartDebugging(
			JavaScriptRuntime handle,
			JavaScriptDiagDebugEventCallback debugEventCallback,
			IntPtr callbackState);

		[DllImport(DllName)]
		internal static extern JavaScriptErrorCode JsDiagSetStepType(JavaScriptDiagStepType stepType);
	}
}