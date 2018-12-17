namespace ChakraHost.Hosting
{
    using System;
    using System.Runtime.InteropServices;

    /// <summary>
    ///     A JavaScript value.
    /// </summary>
    /// <remarks>
    ///     A JavaScript value is one of the following types of values: Undefined, Null, Boolean, 
    ///     String, Number, or Object.
    /// </remarks>
    public struct JavaScriptValue
    {
        /// <summary>
        /// The reference.
        /// </summary>
        private readonly IntPtr reference;

        /// <summary>
        ///     Initializes a new instance of the <see cref="JavaScriptValue"/> struct.
        /// </summary>
        /// <param name="reference">The reference.</param>
        private JavaScriptValue(IntPtr reference)
        {
            this.reference = reference;
        }

        /// <summary>
        ///     Gets an invalid value.
        /// </summary>
        public static JavaScriptValue Invalid
        {
            get { return new JavaScriptValue(IntPtr.Zero); }
        }

        /// <summary>
        ///     Gets the value of <c>undefined</c> in the current script context.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        public static JavaScriptValue Undefined
        {
            get
            {
                NativeMethods.ThrowIfError(NativeMethods.JsGetUndefinedValue(out JavaScriptValue value));
                return value;
            }
        }

        /// <summary>
        ///     Gets the value of <c>null</c> in the current script context.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        public static JavaScriptValue Null
        {
            get
            {
                NativeMethods.ThrowIfError(NativeMethods.JsGetNullValue(out JavaScriptValue value));
                return value;
            }
        }

        /// <summary>
        ///     Gets the value of <c>true</c> in the current script context.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        public static JavaScriptValue True
        {
            get
            {
				NativeMethods.ThrowIfError(NativeMethods.JsGetTrueValue(out JavaScriptValue value));
				return value;
            }
        }

        /// <summary>
        ///     Gets the value of <c>false</c> in the current script context.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        public static JavaScriptValue False
        {
            get
            {
				NativeMethods.ThrowIfError(NativeMethods.JsGetFalseValue(out JavaScriptValue value));
				return value;
            }
        }

        /// <summary>
        ///     Gets the global object in the current script context.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        public static JavaScriptValue GlobalObject
        {
            get
            {
				NativeMethods.ThrowIfError(NativeMethods.JsGetGlobalObject(out JavaScriptValue value));
				return value;
            }
        }

        /// <summary>
        ///     Gets a value indicating whether the value is valid.
        /// </summary>
        public Boolean IsValid
        {
            get { return reference != IntPtr.Zero; }
        }

        /// <summary>
        ///     Gets the JavaScript type of the value.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <returns>The type of the value.</returns>
        public JavaScriptValueType ValueType
        {
            get
            {
				NativeMethods.ThrowIfError(NativeMethods.JsGetValueType(this, out JavaScriptValueType type));
				return type;
            }
        }

        /// <summary>
        ///     Gets the length of a <c>String</c> value.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <returns>The length of the string.</returns>
        public Int32 StringLength
        {
            get
            {
                NativeMethods.ThrowIfError(NativeMethods.JsGetStringLength(this, out Int32 length));
                return length;
            }
        }

        /// <summary>
        ///     Gets or sets the prototype of an object.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        public JavaScriptValue Prototype
        {
            get
            {
				NativeMethods.ThrowIfError(NativeMethods.JsGetPrototype(this, out JavaScriptValue prototypeReference));
				return prototypeReference;
            }

            set
            {
                NativeMethods.ThrowIfError(NativeMethods.JsSetPrototype(this, value));
            }
        }

        /// <summary>
        ///     Gets a value indicating whether an object is extensible or not.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        public Boolean IsExtensionAllowed
        {
            get
            {
				NativeMethods.ThrowIfError(NativeMethods.JsGetExtensionAllowed(this, out Boolean allowed));
				return allowed;
            }
        }

        /// <summary>
        ///     Gets a value indicating whether an object is an external object.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        public Boolean HasExternalData
        {
            get
            {
				NativeMethods.ThrowIfError(NativeMethods.JsHasExternalData(this, out Boolean hasExternalData));
				return hasExternalData;
            }
        }

        /// <summary>
        ///     Gets or sets the data in an external object.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        public IntPtr ExternalData
        {
            get
            {
				NativeMethods.ThrowIfError(NativeMethods.JsGetExternalData(this, out IntPtr data));
				return data;
            }

            set
            {
                NativeMethods.ThrowIfError(NativeMethods.JsSetExternalData(this, value));
            }
        }

        /// <summary>
        ///     Creates a <c>Boolean</c> value from a <c>bool</c> value.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="value">The value to be converted.</param>
        /// <returns>The converted value.</returns>
        public static JavaScriptValue FromBoolean(Boolean value)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsBoolToBoolean(value, out JavaScriptValue reference));
			return reference;
        }

        /// <summary>
        ///     Creates a <c>Number</c> value from a <c>double</c> value.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="value">The value to be converted.</param>
        /// <returns>The new <c>Number</c> value.</returns>
        public static JavaScriptValue FromDouble(Double value)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsDoubleToNumber(value, out JavaScriptValue reference));
			return reference;
        }

        /// <summary>
        ///     Creates a <c>Number</c> value from a <c>int</c> value.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="value">The value to be converted.</param>
        /// <returns>The new <c>Number</c> value.</returns>
        public static JavaScriptValue FromInt32(Int32 value)
        {
            NativeMethods.ThrowIfError(NativeMethods.JsIntToNumber(value, out JavaScriptValue reference));
            return reference;
        }

        /// <summary>
        ///     Creates a <c>String</c> value from a string pointer.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="value">The string  to convert to a <c>String</c> value.</param>
        /// <returns>The new <c>String</c> value.</returns>
        public static JavaScriptValue FromString(String value)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsPointerToString(value, new UIntPtr((UInt32)value.Length), out JavaScriptValue reference));
			return reference;
        }

        /// <summary>
        ///     Creates a new <c>Object</c>.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <returns>The new <c>Object</c>.</returns>
        public static JavaScriptValue CreateObject()
        {
			NativeMethods.ThrowIfError(NativeMethods.JsCreateObject(out JavaScriptValue reference));
			return reference;
        }

        /// <summary>
        ///     Creates a new <c>Object</c> that stores some external data.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="data">External data that the object will represent. May be null.</param>
        /// <param name="finalizer">
        ///     A callback for when the object is finalized. May be null.
        /// </param>
        /// <returns>The new <c>Object</c>.</returns>
        public static JavaScriptValue CreateExternalObject(IntPtr data, JavaScriptObjectFinalizeCallback finalizer)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsCreateExternalObject(data, finalizer, out JavaScriptValue reference));
			return reference;
        }

        /// <summary>
        ///     Creates a new JavaScript function.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="function">The method to call when the function is invoked.</param>
        /// <returns>The new function object.</returns>
        public static JavaScriptValue CreateFunction(JavaScriptNativeFunction function)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsCreateFunction(function, IntPtr.Zero, out JavaScriptValue reference));
			return reference;
        }

        /// <summary>
        ///     Creates a new JavaScript function.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="function">The method to call when the function is invoked.</param>
        /// <param name="callbackData">Data to be provided to all function callbacks.</param>
        /// <returns>The new function object.</returns>
        public static JavaScriptValue CreateFunction(JavaScriptNativeFunction function, IntPtr callbackData)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsCreateFunction(function, callbackData, out JavaScriptValue reference));
			return reference;
        }

        /// <summary>
        ///     Creates a JavaScript array object.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="length">The initial length of the array.</param>
        /// <returns>The new array object.</returns>
        public static JavaScriptValue CreateArray(UInt32 length)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsCreateArray(length, out JavaScriptValue reference));
			return reference;
        }

        /// <summary>
        ///     Creates a new JavaScript error object
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="message">Message for the error object.</param>
        /// <returns>The new error object.</returns>
        public static JavaScriptValue CreateError(JavaScriptValue message)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsCreateError(message, out JavaScriptValue reference));
			return reference;
        }

        /// <summary>
        ///     Creates a new JavaScript RangeError error object
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="message">Message for the error object.</param>
        /// <returns>The new error object.</returns>
        public static JavaScriptValue CreateRangeError(JavaScriptValue message)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsCreateRangeError(message, out JavaScriptValue reference));
			return reference;
        }

        /// <summary>
        ///     Creates a new JavaScript ReferenceError error object
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="message">Message for the error object.</param>
        /// <returns>The new error object.</returns>
        public static JavaScriptValue CreateReferenceError(JavaScriptValue message)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsCreateReferenceError(message, out JavaScriptValue reference));
			return reference;
        }

        /// <summary>
        ///     Creates a new JavaScript SyntaxError error object
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="message">Message for the error object.</param>
        /// <returns>The new error object.</returns>
        public static JavaScriptValue CreateSyntaxError(JavaScriptValue message)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsCreateSyntaxError(message, out JavaScriptValue reference));
			return reference;
        }

        /// <summary>
        ///     Creates a new JavaScript TypeError error object
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="message">Message for the error object.</param>
        /// <returns>The new error object.</returns>
        public static JavaScriptValue CreateTypeError(JavaScriptValue message)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsCreateTypeError(message, out JavaScriptValue reference));
			return reference;
        }

        /// <summary>
        ///     Creates a new JavaScript URIError error object
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="message">Message for the error object.</param>
        /// <returns>The new error object.</returns>
        public static JavaScriptValue CreateUriError(JavaScriptValue message)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsCreateURIError(message, out JavaScriptValue reference));
			return reference;
        }

        /// <summary>
        ///     Adds a reference to the object.
        /// </summary>
        /// <remarks>
        ///     This only needs to be called on objects that are not going to be stored somewhere on 
        ///     the stack. Calling AddRef ensures that the JavaScript object the value refers to will not be freed 
        ///     until Release is called
        /// </remarks>
        /// <returns>The object's new reference count.</returns>
        public UInt32 AddRef()
        {
			NativeMethods.ThrowIfError(NativeMethods.JsAddRef(this, out UInt32 count));
			return count;
        }

        /// <summary>
        ///     Releases a reference to the object.
        /// </summary>
        /// <remarks>
        ///     Removes a reference that was created by AddRef.
        /// </remarks>
        /// <returns>The object's new reference count.</returns>
        public UInt32 Release()
        {
			NativeMethods.ThrowIfError(NativeMethods.JsRelease(this, out UInt32 count));
			return count;
        }

        /// <summary>
        ///     Retrieves the <c>bool</c> value of a <c>Boolean</c> value.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <returns>The converted value.</returns>
        public Boolean ToBoolean()
        {
			NativeMethods.ThrowIfError(NativeMethods.JsBooleanToBool(this, out Boolean value));
			return value;
        }

        /// <summary>
        ///     Retrieves the <c>double</c> value of a <c>Number</c> value.
        /// </summary>
        /// <remarks>
        ///     <para>
        ///     This function retrieves the value of a Number value. It will fail with 
        ///     <c>InvalidArgument</c> if the type of the value is not <c>Number</c>.
        ///     </para>
        ///     <para>
        ///     Requires an active script context.
        ///     </para>
        /// </remarks>
        /// <returns>The <c>double</c> value.</returns>
        public Double ToDouble()
        {
			NativeMethods.ThrowIfError(NativeMethods.JsNumberToDouble(this, out Double value));
			return value;
        }

        /// <summary>
        ///     Retrieves the string pointer of a <c>String</c> value.
        /// </summary>
        /// <remarks>
        ///     <para>
        ///     This function retrieves the string pointer of a <c>String</c> value. It will fail with 
        ///     <c>InvalidArgument</c> if the type of the value is not <c>String</c>.
        ///     </para>
        ///     <para>
        ///     Requires an active script context.
        ///     </para>
        /// </remarks>
        /// <returns>The string.</returns>
        public new String ToString()
        {
			NativeMethods.ThrowIfError(NativeMethods.JsStringToPointer(this, out IntPtr buffer, out UIntPtr length));
			return Marshal.PtrToStringUni(buffer, (Int32)length);
        }

        /// <summary>
        ///     Converts the value to <c>Boolean</c> using regular JavaScript semantics.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <returns>The converted value.</returns>
        public JavaScriptValue ConvertToBoolean()
        {
			NativeMethods.ThrowIfError(NativeMethods.JsConvertValueToBoolean(this, out JavaScriptValue booleanReference));
			return booleanReference;
        }

        /// <summary>
        ///     Converts the value to <c>Number</c> using regular JavaScript semantics.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <returns>The converted value.</returns>
        public JavaScriptValue ConvertToNumber()
        {
			NativeMethods.ThrowIfError(NativeMethods.JsConvertValueToNumber(this, out JavaScriptValue numberReference));
			return numberReference;
        }

        /// <summary>
        ///     Converts the value to <c>String</c> using regular JavaScript semantics.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <returns>The converted value.</returns>
        public JavaScriptValue ConvertToString()
        {
			NativeMethods.ThrowIfError(NativeMethods.JsConvertValueToString(this, out JavaScriptValue stringReference));
			return stringReference;
        }

        /// <summary>
        ///     Converts the value to <c>Object</c> using regular JavaScript semantics.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <returns>The converted value.</returns>
        public JavaScriptValue ConvertToObject()
        {
			NativeMethods.ThrowIfError(NativeMethods.JsConvertValueToObject(this, out JavaScriptValue objectReference));
			return objectReference;
        }

        /// <summary>
        ///     Sets an object to not be extensible.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        public void PreventExtension()
        {
            NativeMethods.ThrowIfError(NativeMethods.JsPreventExtension(this));
        }

        /// <summary>
        ///     Gets a property descriptor for an object's own property.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="propertyId">The ID of the property.</param>
        /// <returns>The property descriptor.</returns>
        public JavaScriptValue GetOwnPropertyDescriptor(JavaScriptPropertyId propertyId)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsGetOwnPropertyDescriptor(this, propertyId, out JavaScriptValue descriptorReference));
			return descriptorReference;
        }

        /// <summary>
        ///     Gets the list of all properties on the object.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <returns>An array of property names.</returns>
        public JavaScriptValue GetOwnPropertyNames()
        {
			NativeMethods.ThrowIfError(NativeMethods.JsGetOwnPropertyNames(this, out JavaScriptValue propertyNamesReference));
			return propertyNamesReference;
        }

        /// <summary>
        ///     Determines whether an object has a property.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="propertyId">The ID of the property.</param>
        /// <returns>Whether the object (or a prototype) has the property.</returns>
        public Boolean HasProperty(JavaScriptPropertyId propertyId)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsHasProperty(this, propertyId, out Boolean hasProperty));
			return hasProperty;
        }

        /// <summary>
        ///     Gets an object's property.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="id">The ID of the property.</param>
        /// <returns>The value of the property.</returns>
        public JavaScriptValue GetProperty(JavaScriptPropertyId id)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsGetProperty(this, id, out JavaScriptValue propertyReference));
			return propertyReference;
        }

        /// <summary>
        ///     Sets an object's property.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="id">The ID of the property.</param>
        /// <param name="value">The new value of the property.</param>
        /// <param name="useStrictRules">The property set should follow strict mode rules.</param>
        public void SetProperty(JavaScriptPropertyId id, JavaScriptValue value, Boolean useStrictRules)
        {
            NativeMethods.ThrowIfError(NativeMethods.JsSetProperty(this, id, value, useStrictRules));
        }

        /// <summary>
        ///     Deletes an object's property.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="propertyId">The ID of the property.</param>
        /// <param name="useStrictRules">The property set should follow strict mode rules.</param>
        /// <returns>Whether the property was deleted.</returns>
        public JavaScriptValue DeleteProperty(JavaScriptPropertyId propertyId, Boolean useStrictRules)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsDeleteProperty(this, propertyId, useStrictRules, out JavaScriptValue returnReference));
			return returnReference;
        }

        /// <summary>
        ///     Defines a new object's own property from a property descriptor.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="propertyId">The ID of the property.</param>
        /// <param name="propertyDescriptor">The property descriptor.</param>
        /// <returns>Whether the property was defined.</returns>
        public Boolean DefineProperty(JavaScriptPropertyId propertyId, JavaScriptValue propertyDescriptor)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsDefineProperty(this, propertyId, propertyDescriptor, out Boolean result));
			return result;
        }

        /// <summary>
        ///     Test if an object has a value at the specified index.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="index">The index to test.</param>
        /// <returns>Whether the object has an value at the specified index.</returns>
        public Boolean HasIndexedProperty(JavaScriptValue index)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsHasIndexedProperty(this, index, out Boolean hasProperty));
			return hasProperty;
        }

        /// <summary>
        ///     Retrieve the value at the specified index of an object.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="index">The index to retrieve.</param>
        /// <returns>The retrieved value.</returns>
        public JavaScriptValue GetIndexedProperty(JavaScriptValue index)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsGetIndexedProperty(this, index, out JavaScriptValue propertyReference));
			return propertyReference;
        }

        /// <summary>
        ///     Set the value at the specified index of an object.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="index">The index to set.</param>
        /// <param name="value">The value to set.</param>
        public void SetIndexedProperty(JavaScriptValue index, JavaScriptValue value)
        {
            NativeMethods.ThrowIfError(NativeMethods.JsSetIndexedProperty(this, index, value));
        }

        /// <summary>
        ///     Delete the value at the specified index of an object.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="index">The index to delete.</param>
        public void DeleteIndexedProperty(JavaScriptValue index)
        {
            NativeMethods.ThrowIfError(NativeMethods.JsDeleteIndexedProperty(this, index));
        }

        /// <summary>
        ///     Compare two JavaScript values for equality.
        /// </summary>
        /// <remarks>
        ///     <para>
        ///     This function is equivalent to the "==" operator in JavaScript.
        ///     </para>
        ///     <para>
        ///     Requires an active script context.
        ///     </para>
        /// </remarks>
        /// <param name="other">The object to compare.</param>
        /// <returns>Whether the values are equal.</returns>
        public Boolean Equals(JavaScriptValue other)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsEquals(this, other, out Boolean equals));
			return equals;
        }

        /// <summary>
        ///     Compare two JavaScript values for strict equality.
        /// </summary>
        /// <remarks>
        ///     <para>
        ///     This function is equivalent to the "===" operator in JavaScript.
        ///     </para>
        ///     <para>
        ///     Requires an active script context.
        ///     </para>
        /// </remarks>
        /// <param name="other">The object to compare.</param>
        /// <returns>Whether the values are strictly equal.</returns>
        public Boolean StrictEquals(JavaScriptValue other)
        {
			NativeMethods.ThrowIfError(NativeMethods.JsStrictEquals(this, other, out Boolean equals));
			return equals;
        }

        /// <summary>
        ///     Invokes a function.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="arguments">The arguments to the call.</param>
        /// <returns>The <c>Value</c> returned from the function invocation, if any.</returns>
        public JavaScriptValue CallFunction(params JavaScriptValue[] arguments)
        {
            if (arguments.Length > UInt16.MaxValue)
            {
                throw new ArgumentOutOfRangeException("arguments");
            }

            NativeMethods.ThrowIfError(NativeMethods.JsCallFunction(this, arguments, (UInt16)arguments.Length, out JavaScriptValue returnReference));
            return returnReference;
        }

        /// <summary>
        ///     Invokes a function as a constructor.
        /// </summary>
        /// <remarks>
        ///     Requires an active script context.
        /// </remarks>
        /// <param name="arguments">The arguments to the call.</param>
        /// <returns>The <c>Value</c> returned from the function invocation.</returns>
        public JavaScriptValue ConstructObject(params JavaScriptValue[] arguments)
        {

			if (arguments.Length > UInt16.MaxValue)
			{
				throw new ArgumentOutOfRangeException("arguments");
			}

			NativeMethods.ThrowIfError(NativeMethods.JsConstructObject(this, arguments, (UInt16)arguments.Length, out JavaScriptValue returnReference));
            return returnReference;
        }
    }
}
