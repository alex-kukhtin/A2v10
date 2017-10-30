// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.ComponentModel;

namespace A2v10.Xaml
{
	public class XamlElement : ISupportInitialize, ISupportBinding
	{

		internal XamlElement Parent { get; private set; }

        BindImpl _bindImpl;

        #region ISupportBinding
        public BindImpl BindImpl
        {
            get
            {
                if (_bindImpl == null)
                    _bindImpl = new BindImpl();
                return _bindImpl;
            }
        }

        public Bind GetBinding(String name)
        {
            return _bindImpl?.GetBinding(name);
        }

        public void RemoveBinding(String name)
        {
            _bindImpl?.RemoveBinding(name);
        }

        public void SetBinding(String name, BindBase bind)
        {
            if (bind == null)
                return;
            BindImpl.SetBinding(name, bind);
        }

        public BindCmd GetBindingCommand(String name)
        {
            return _bindImpl?.GetBindingCommand(name);
        }
        #endregion

        protected virtual void OnEndInit()
		{
		}

		internal void SetParent(XamlElement parent)
		{
			Parent = parent;
		}


        internal void MergeBoolAttribute(TagBuilder tag, RenderContext context, String propName, Boolean value)
        {
            var attrBind = GetBinding(propName);
            // bool attrs always with ':'
            String attrName = $":{propName.ToLowerInvariant()}";
            if (attrBind != null)
                tag.MergeAttribute(attrName, attrBind.GetPath(context));
            else if (value)
                tag.MergeAttribute(attrName, value.ToString().ToLowerInvariant());

        }

		#region ISupportInitialize
		public void BeginInit()
		{
			// do nothing
		}

		public void EndInit()
		{
			OnEndInit();
		}
		#endregion
	}
}
