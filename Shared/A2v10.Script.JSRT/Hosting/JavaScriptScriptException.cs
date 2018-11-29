namespace ChakraHostRT.Hosting
{
    using System;
    using System.Runtime.Serialization;

    /// <summary>
    ///     A script exception.
    /// </summary>
    [Serializable]
    public sealed class JavaScriptScriptException : JavaScriptException
    {
        /// <summary>
        /// The error.
        /// </summary>
        //private readonly JavaScriptValue error;

        private String jsMessage = String.Empty;
        /// <summary>
        ///     Initializes a new instance of the <see cref="JavaScriptScriptException"/> class. 
        /// </summary>
        /// <param name="code">The error code returned.</param>
        /// <param name="error">The JavaScript error object.</param>
        public JavaScriptScriptException(JavaScriptErrorCode code, JavaScriptValue error) :
            this(code, error, "JavaScript Exception")
        {
        }

        /// <summary>
        ///     Initializes a new instance of the <see cref="JavaScriptScriptException"/> class. 
        /// </summary>
        /// <param name="code">The error code returned.</param>
        /// <param name="error">The JavaScript error object.</param>
        /// <param name="message">The error message.</param>
        public JavaScriptScriptException(JavaScriptErrorCode code, JavaScriptValue error, string message) :
            base(code, message)
        {
            //this.error = error;
            if (error.IsValid)
                jsMessage = error.GetProperty(JavaScriptPropertyId.FromString("message")).ConvertToString().ToString();
            else
                jsMessage = "Unknown error";
        }

        /// <summary>
        ///     Gets a JavaScript object representing the script error.
        /// </summary>
        /// 
        /*
        public JavaScriptValue Error
        {
            get
            {
                return error;
            }
        }
        */

        /* MY CODE */
        public String GetErrorMessage()
        {
            if (String.IsNullOrEmpty(jsMessage))
                return base.Message;
            return jsMessage;
        }

        public override string Message
        {
            get
            {
                return GetErrorMessage();
            }
        }
    }
}