
using System;

using ChakraHostRT.Hosting;
using System.Runtime.InteropServices;

namespace A2v10.Script.JSRT
{
	public class JSDebugger
	{
		Native.IProcessDebugManager32 _pdm32 = null;
		Native.IDebugApplication32 _pda32 = null;
		Native.IProcessDebugManager64 _pdm64 = null;
		Native.IDebugApplication64 _pda64 = null;

		uint _debugCookie = 0;
		bool _bCreated = false;
		bool _bDisabled = false;

		public void Release()
		{
			RemoveApplication();
			InternalRelease();
		}

		public void StartDebugging()
		{
			if (_bCreated && !_bDisabled)
			{
				if (Environment.Is64BitProcess && (_pda64 != null))
				{
					JavaScriptContext.StartDebugging(_pda64);

				}
				else if (_pda32 != null)
				{
					JavaScriptContext.StartDebugging(_pda32);
				}
			}
		}

		public void Create()
		{
			if (_bCreated)
				return;
			if (_bDisabled)
				return;
			try
			{
				if (Environment.Is64BitProcess)
				{
					_pdm64 = (Native.IProcessDebugManager64)new Native.ProcessDebugManager();
					Native.IDebugApplication64 _pda64 = null;
					_pdm64.CreateApplication(out _pda64);
					_pdm64.AddApplication(_pda64, out _debugCookie);
				}
				else
				{
					_pdm32 = (Native.IProcessDebugManager32)new Native.ProcessDebugManager();
					_pdm32.CreateApplication(out _pda32);
					_pdm32.AddApplication(_pda32, out _debugCookie);
				}
				_bCreated = true;
			}
			catch (Exception /*ex*/)
			{
				InternalRelease();
				_bDisabled = true;
			}
		}

		public void RemoveApplication()
		{
			if (_pdm32 != null)
			{
				_pdm32.RemoveApplication(_debugCookie);
			}
			if (_pdm64 != null)
			{
				_pdm64.RemoveApplication(_debugCookie);
			}
		}

		void InternalRelease()
		{
			if (_pda32 != null)
			{
				Marshal.FinalReleaseComObject(_pda32);
				_pda32 = null;
			}
			if (_pdm32 != null)
			{
				Marshal.FinalReleaseComObject(_pdm32);
				_pdm32 = null;
			}
			if (_pda64 != null)
			{
				Marshal.FinalReleaseComObject(_pda64);
				_pda64 = null;
			}
			if (_pdm64 != null)
			{
				Marshal.FinalReleaseComObject(_pdm64);
				_pdm64 = null;
			}
		}
	}
}
