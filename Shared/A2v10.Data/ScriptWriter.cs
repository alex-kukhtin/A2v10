using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
            sb.AppendLine("\tconst cmn = require('datamodel');");
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
                sb.Append($"{k.Key}: {k.Value}\n");
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
            sb.Remove(sb.Length - 1, 1); // remove tail comma
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
            .Append($"cmn.defineObject({name}, {{")
            .Append(GetProperties(ctor))
            .AppendLine($"}}, {arrItem});");

            if (ctor.IsArrayType)
            {
                sb.AppendLine($"function {name}Array(source, path, parent) {{")
                .AppendLine($"return cmn.createArray(source, path, {name}, {name}Array, parent);")
                .AppendLine("}");
            }
            return sb;
        }

        public StringBuilder GetProperties(ElementMetadata meta)
        {
            var sb = new StringBuilder();
            foreach (var fd in meta.Fields) {
                var fm = fd.Value;
                sb.AppendLine()
                .Append(fd.Key)
                .Append(':');
                // TODO: special data type
                if (fm.ItemType == FieldType.Array)
                    sb.Append(fm.RefObject + "Array");
                else if (fm.ItemType == FieldType.Object)
                    sb.Append(fm.RefObject);
                else
                    sb.Append(fm.DataType);
                sb.Append(",");
            }
            sb.Remove(sb.Length - 1, 1); // remove tail comma
            return sb;
        }
    }
}
