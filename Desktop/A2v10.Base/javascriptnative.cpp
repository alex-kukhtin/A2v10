
#include "stdafx.h"

#include "../include/javascriptpropertyid.h"
#include "../include/javascriptvalue.h"
#include "../include/javascriptnative.h"
#include "../include/javascriptexceptions.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// static 
void JavaScriptNative::ThrowIfError(JsErrorCode error)
{
	if (error != JsErrorCode::JsNoError)
	{
		switch (error)
		{
		case JsErrorCode::JsErrorInvalidArgument:
			throw JavaScriptUsageException(error, L"Invalid argument.");

		case JsErrorCode::JsErrorNullArgument:
			throw JavaScriptUsageException(error, L"Null argument.");

		case JsErrorCode::JsErrorNoCurrentContext:
			throw JavaScriptUsageException(error, L"No current context.");

		case JsErrorCode::JsErrorInExceptionState:
			throw JavaScriptUsageException(error, L"Runtime is in exception state.");

		case JsErrorCode::JsErrorNotImplemented:
			throw JavaScriptUsageException(error, L"Method is not implemented.");

		case JsErrorCode::JsErrorWrongThread:
			throw JavaScriptUsageException(error, L"Runtime is active on another thread.");

		case JsErrorCode::JsErrorRuntimeInUse:
			throw JavaScriptUsageException(error, L"Runtime is in use.");

		case JsErrorCode::JsErrorBadSerializedScript:
			throw JavaScriptUsageException(error, L"Bad serialized script.");

		case JsErrorCode::JsErrorInDisabledState:
			throw JavaScriptUsageException(error, L"Runtime is disabled.");

		case JsErrorCode::JsErrorCannotDisableExecution:
			throw JavaScriptUsageException(error, L"Cannot disable execution.");

		case JsErrorCode::JsErrorAlreadyDebuggingContext:
			throw JavaScriptUsageException(error, L"Context is already in debug mode.");

		case JsErrorCode::JsErrorHeapEnumInProgress:
			throw JavaScriptUsageException(error, L"Heap enumeration is in progress.");

		case JsErrorCode::JsErrorArgumentNotObject:
			throw JavaScriptUsageException(error, L"Argument is not an object.");

		case JsErrorCode::JsErrorInProfileCallback:
			throw JavaScriptUsageException(error, L"In a profile callback.");

		case JsErrorCode::JsErrorInThreadServiceCallback:
			throw JavaScriptUsageException(error, L"In a thread service callback.");

		case JsErrorCode::JsErrorCannotSerializeDebugScript:
			throw JavaScriptUsageException(error, L"Cannot serialize a debug script.");

		case JsErrorCode::JsErrorAlreadyProfilingContext:
			throw JavaScriptUsageException(error, L"Already profiling this context.");

		case JsErrorCode::JsErrorIdleNotEnabled:
			throw JavaScriptUsageException(error, L"Idle is not enabled.");

		case JsErrorCode::JsErrorOutOfMemory:
			throw JavaScriptEngineException(error, L"Out of memory.");

		case JsErrorCode::JsErrorScriptException:
		{
			JavaScriptValue errorObject;
			JsErrorCode innerError = JsGetAndClearException(errorObject);

			if (innerError != JsErrorCode::JsNoError)
			{
				throw JavaScriptFatalException(innerError);
			}

			throw JavaScriptScriptException(error, errorObject, L"Script threw an exception.");
		}

		case JsErrorCode::JsErrorScriptCompile:
		{
			JavaScriptValue errorObject;
			JsErrorCode innerError = JsGetAndClearException(errorObject);

			if (innerError != JsErrorCode::JsNoError)
			{
				throw JavaScriptFatalException(innerError);
			}

			throw JavaScriptScriptException(error, errorObject, L"Compile error.");
		}

		case JsErrorCode::JsErrorScriptTerminated:
			throw JavaScriptScriptException(error, JavaScriptValue::Invalid(), L"Script was terminated.");

		case JsErrorCode::JsErrorScriptEvalDisabled:
			throw JavaScriptScriptException(error, JavaScriptValue::Invalid(), L"Eval of strings is disabled in this runtime.");

		case JsErrorCode::JsErrorFatal:
			throw JavaScriptFatalException(error);

		default:
			throw JavaScriptFatalException(error);
		}
	}
}
