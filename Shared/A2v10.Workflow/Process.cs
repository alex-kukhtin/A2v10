// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Runtime.Serialization;
using System.Activities;
using System.Dynamic;
using System.Collections.Generic;
using System.Reflection;

using A2v10.Infrastructure;
using System.Threading.Tasks;

namespace A2v10.Workflow
{
    [DataContract]
    public class Process
    {
        [DataMember]
        public Int64 Id { get; set; }
        [DataMember]
        public Int64 Owner { get; set; }
        [DataMember]
        public String Kind { get; set; }
        [DataMember]
        public String DataSource { get; set; }
        [DataMember]
        public String Schema { get; set; }
        [DataMember]
        public String ModelName { get; set; }
        [DataMember]
        public Int64 ModelId { get; set; }

        [DataMember]
        public Guid WorkflowId { get; set; }

        public String Source { get; set; }
        public String Definition { get; set; }

        [DataMember]
        public String ActionBase { get; set; }

        public IDataModel Model => GetModel();

        public IDictionary<String, Object> CreateParams(Object obj)
        {
            var props = obj.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);
            var result = new Dictionary<String, Object>();
            foreach (var p in props)
            {
                result.Add(p.Name, p.GetValue(obj, null));
            }
            return result;
        }


        internal static Process Create(WorkflowDefinition def, StartWorkflowInfo info)
        {
            var p = new Process();
            p.Kind = def.Name;
            p.Definition = def.Definition;
            p.ActionBase = info.ActionBase;
            p.Source = def.Source;
            p.Owner = info.UserId;
            p.DataSource = info.DataSource;
            p.Schema = info.Schema;
            p.ModelName = info.Model;
            p.ModelId = info.ModelId;
            return p;
        }

        internal static Process GetProcessFromContext(WorkflowDataContext DataContext)
        {
            var pi = DataContext.GetProperties()["Process"];
            var process = pi.GetValue(DataContext) as Process;
            return process;
        }

        internal async Task Start(IDbContext dbContext)
        {
            await dbContext.ExecuteAsync<Process>(null, "a2workflow.[Process.Create]", this);
            if (this.Id == 0)
                throw new WorkflowException("Failed to start process");
        }

        private IDataModel _model = null;

        private IDataModel GetModel()
        {
            IDbContext dbContext = ServiceLocator.Current.GetService<IDbContext>();
            if (_model != null)
                return _model;
            String proc = $"[{this.Schema}].[{this.ModelName}.Load]";
            ExpandoObject loadPrms = new ExpandoObject();
            loadPrms.Set("Id", ModelId);
            loadPrms.Set("UserId", 0L);
            _model = dbContext.LoadModel(this.DataSource, proc, loadPrms);
            return _model;
        }
    }
}
