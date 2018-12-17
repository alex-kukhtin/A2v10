namespace ChakraHost.Hosting
{
	using System;
	using System.Runtime.Serialization;

#pragma warning disable IDE0049
	/// <summary>
	///     A script exception.
	/// </summary>
	[Serializable]
	public sealed class JavaScriptScriptException : JavaScriptException
	{
		/// <summary>
		/// The error.
		/// </summary>
		private readonly JavaScriptValue error;

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
			this.error = error;
		}

		/// <summary>
		///     Initializes a new instance of the <see cref="JavaScriptScriptException"/> class.
		/// </summary>
		/// <param name="info">The serialization info.</param>
		/// <param name="context">The streaming context.</param>
		private JavaScriptScriptException(string message, Exception innerException) :
			base(message, innerException)
		{
		}

		/// <summary>
		///     Gets a JavaScript object representing the script error.
		/// </summary>
		public JavaScriptValue Error
		{
			get
			{
				return error;
			}
		}

		/* MY CODE */
		public String GetErrorMessage()
		{
			if (error.IsValid)
				return error.GetProperty(JavaScriptPropertyId.FromString("message")).ConvertToString().ToString();
			return base.Message;
		}

		public override string Message
		{
			get
			{
				return GetErrorMessage();
			}
		}

		public override void GetObjectData(SerializationInfo info, StreamingContext context)
		{
			base.GetObjectData(info, context);
		}
	}
#pragma warning restore IDE0049
}