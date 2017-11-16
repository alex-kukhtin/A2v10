// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Text;
using A2v10.Infrastructure;

namespace A2v10.Data
{
    internal class ScriptWriter
    {
        DynamicDataModel _model;

        public ScriptWriter(DynamicDataModel model)
        {
            _model = model;
        }

        public String GetScript()
        {
            var sb = new StringBuilder();
            sb.AppendLine("function modelData(template, data) {");
            sb.AppendLine("\tconst cmn = require('std:datamodel');");
            if (_model.Metadata != null) {
                sb.Append(GetConstructors());
            }
            sb.AppendLine("\tcmn.implementRoot(TRoot, template, ctors);");
            sb.AppendLine("\tlet root = new TRoot(data);");
            sb.AppendLine(SetModelInfo());
            sb.AppendLine("\treturn root;");
            sb.AppendLine("}");
            return sb.ToString();
        }

        public String SetModelInfo()
        {
            if (_model.System == null)
                return null;
            var sb = new StringBuilder("\tcmn.setModelInfo(root, {\n");
            foreach (var k in _model.System as IDictionary<String, Object>)
            {
                var val = k.Value;
                if (val is Boolean)
                    val = val.ToString().ToLowerInvariant();
                else if (val is String)
                    val = $"'{val}'";
                sb.Append($"{k.Key}: {val}\n");
            }
            sb.Append("});");
            return sb.ToString();
        }

        public StringBuilder GetConstructors()
        {
            if (_model.Metadata == null)
                return null;
            var meta = _model.Metadata as IDictionary<String, ElementMetadata>;
            var sb = new StringBuilder();
            foreach (var m in meta)
            {
                sb.Append(GetOneConstructor(m.Key, m.Value));
                sb.AppendLine();
            }
            // make ctors
            sb.Append("const ctors = {");
            foreach (var re in meta)
            {
                sb.Append(re.Key).Append(",");
                if (re.Value.IsArrayType)
                    sb.Append(re.Key + "Array").Append(",");
            }
            sb.RemoveTailComma();
            sb.AppendLine("};");
            return sb;
        }

        public StringBuilder GetOneConstructor(String name, ElementMetadata ctor)
        {
            var sb = new StringBuilder();
            String arrItem = ctor.IsArrayType ? "true" : "false";

            sb.AppendLine($"function {name}(source, path, parent) {{")
            .AppendLine("\tcmn.createObject(this, source, path, parent);")
            .AppendLine("}")
            // metadata
            .Append($"cmn.defineObject({name}, {{props: {{")
            .Append(GetProperties(ctor))
            .Append("}")
            .Append(GetSpecialProperties(ctor))
            .AppendLine($"}}, {arrItem});");

            if (ctor.IsArrayType)
            {
                sb.AppendLine($"function {name}Array(source, path, parent) {{")
                .AppendLine($"return cmn.createArray(source, path, {name}, {name}Array, parent);")
                .AppendLine("}");
            }
            return sb;
        }

        public String GetSpecialProperties(ElementMetadata meta)
        {
            StringBuilder sb = new StringBuilder();
            if (!String.IsNullOrEmpty(meta.Id))
                sb.Append($"$id: '{meta.Id}',");
            if (!String.IsNullOrEmpty(meta.Name))
                sb.Append($"$name: '{meta.Name}',");
            if (!String.IsNullOrEmpty(meta.RowNumber))
                sb.Append($"$rowNo: '{meta.RowNumber}',");
            if (!String.IsNullOrEmpty(meta.HasChildren))
                sb.Append($"$hasChildren: '{meta.HasChildren}',");
            if (!String.IsNullOrEmpty(meta.Permissions))
                sb.Append($"$permissions: '{meta.Permissions}',");
            StringBuilder lazyFields = new StringBuilder();
            foreach (var f in meta.Fields)
            {
                if (f.Value.IsLazy)
                    lazyFields.Append($"'{f.Key}',");
            }
            if (lazyFields.Length != 0)
            {
                lazyFields.RemoveTailComma();
                sb.Append($"$lazy: [{lazyFields.ToString()}]");
            }
            if (sb.Length == 0)
                return null;
            sb.RemoveTailComma();
            return ",\n" + sb.ToString();
        }

        public StringBuilder GetProperties(ElementMetadata meta)
        {
            var sb = new StringBuilder();
            foreach (var fd in meta.Fields) {
                var fm = fd.Value;
                sb.AppendLine()
                .Append($"'{fd.Key}'")
                .Append(':');
                // TODO: special data type
                if (fm.ItemType == FieldType.Array)
                    sb.Append(fm.RefObject + "Array");
                else if (fm.ItemType == FieldType.Tree)
                    sb.Append(fm.RefObject + "Array");
                else if (fm.ItemType == FieldType.Object)
                    sb.Append(fm.RefObject);
                else if (fm.DataType == DataType.Undefined)
                    throw new DataLoaderException($"Invalid data type for '{meta.Name}.{fd.Key}'");
                else
                    sb.Append(fm.DataType);
                sb.Append(",");
            }
            if (sb.Length == 0)
                return sb;
            sb.RemoveTailComma();
            return sb;
        }
    }
}
