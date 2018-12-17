namespace ChakraHost.Hosting
{
    using System;
    using System.Runtime.Serialization;

#pragma warning disable IDE0049 // Use framework type
	/// <summary>
	///     An exception that occurred in the workings of the JavaScript engine itself.
	/// </summary>
	[Serializable]
    public sealed class JavaScriptEngineException : JavaScriptException
    {
        /// <summary>
        ///     Initializes a new instance of the <see cref="JavaScriptEngineException"/> class. 
        /// </summary>
        /// <param name="code">The error code returned.</param>
        public JavaScriptEngineException(JavaScriptErrorCode code) :
            this(code, "A fatal exception has occurred in a JavaScript runtime")
        {
        }

							   /// <summary>
							   ///     Initializes a new instance of the <see cref="JavaScriptEngineException"/> class. 
							   /// </summary>
							   /// <param name="code">The error code returned.</param>
							   /// <param name="message">The error message.</param>
		public JavaScriptEngineException(JavaScriptErrorCode code, string message) :
			base(code, message)
        {
        }

        /// <summary>
        ///     Initializes a new instance of the <see cref="JavaScriptEngineException"/> class.
        /// </summary>
        /// <param name="info">The serialization info.</param>
        /// <param name="context">The streaming context.</param>
        private JavaScriptEngineException(string message, Exception innerException) :
            base(message, innerException)
        {
        }
    }
#pragma warning restore IDE0049 // Use framework type
}