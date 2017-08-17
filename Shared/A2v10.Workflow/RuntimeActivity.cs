
using System;
using System.Linq;
using System.Activities;
using System.Activities.Expressions;
using System.Activities.XamlIntegration;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace A2v10.Workflow
{
    internal static class RuntimeActivity
    {
        static IDictionary<String, Type> _cache = new ConcurrentDictionary<String, Type>();

        static void CacheType(String key, Type type)
        {
            if (_cache.ContainsKey(key))
                return;
            _cache.Add(key, type);
        }

        static Type GetCachedType(String key)
        {
            Type type;
            if (_cache.TryGetValue(key, out type))
                return type;
            return null;
        }

        static Type CompileExpressions(DynamicActivity dynamicActivity)
        {
            // activityName is the Namespace.Type of the activity that contains the  
            // C# expressions. For Dynamic Activities this can be retrieved using the  
            // name property , which must be in the form Namespace.Type.  
            string activityName = dynamicActivity.Name;
            // Split activityName into Namespace and Type.Append _CompiledExpressionRoot to the type name  
            // to represent the new type that represents the compiled expressions.  
            // Take everything after the last . for the type name.  
            string activityType = activityName.Split('.').Last() + "_CompiledExpressionRoot";
            // Take everything before the last . for the namespace.  
            string activityNamespace = string.Join(".", activityName.Split('.').Reverse().Skip(1).Reverse());

            // Create a TextExpressionCompilerSettings.  
            TextExpressionCompilerSettings settings = new TextExpressionCompilerSettings
            {
                Activity = dynamicActivity,
                Language = "C#",
                ActivityName = activityType,
                ActivityNamespace = activityNamespace,
                RootNamespace = null,
                GenerateAsPartialClass = false,
                AlwaysGenerateSource = true,
                ForImplementation = true
            };

            // Compile the C# expression.  
            TextExpressionCompilerResults results =
                new TextExpressionCompiler(settings).Compile();

            // Any compilation errors are contained in the CompilerMessages.  
            if (results.HasErrors)
            {
                throw new Exception("Compilation failed.");
            }

            // Create an instance of the new compiled expression type.  
            ICompiledExpressionRoot compiledExpressionRoot =
                Activator.CreateInstance(results.ResultType,
                    new object[] { dynamicActivity }) as ICompiledExpressionRoot;

            // Attach it to the activity.  
            CompiledExpressionInvoker.SetCompiledExpressionRootForImplementation(
                dynamicActivity, compiledExpressionRoot);
            return results.ResultType;
        }

        static void CreateCompiledActivity(DynamicActivity dynamicActivity, Type resultType)
        {
            ICompiledExpressionRoot compiledExpressionRoot =
                Activator.CreateInstance(resultType,
                    new object[] { dynamicActivity }) as ICompiledExpressionRoot;

            // Attach it to the activity.  
            CompiledExpressionInvoker.SetCompiledExpressionRootForImplementation(
                dynamicActivity, compiledExpressionRoot);
        }

        public static void Compile(String name, Activity root)
        {
            Type cachedType = RuntimeActivity.GetCachedType(name);
            if (cachedType != null)
                RuntimeActivity.CreateCompiledActivity(root as DynamicActivity, cachedType);
            else
            {
                cachedType = RuntimeActivity.CompileExpressions(root as DynamicActivity);
                RuntimeActivity.CacheType(name, cachedType);
            }
        }
    }
}
