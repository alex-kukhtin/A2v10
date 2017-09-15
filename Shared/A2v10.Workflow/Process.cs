using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Runtime.Serialization;
using A2v10.Infrastructure;
using System.Activities;
using System.Dynamic;

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
        public String Schema { get; set; }
        [DataMember]
        public String Model { get; set; }
        [DataMember]
        public Int64 ModelId { get; set; }

        [DataMember]
        public Guid WorkflowId { get; set; }

        public String Source { get; set; }
        public String Definition { get; set; }

        internal static Process Create(WorkflowDefinition def, StartWorkflowInfo info)
        {
            var p = new Process();
            p.Kind = def.Name;
            p.Definition = def.Definition;
            p.Source = def.Source;
            p.Owner = info.UserId;
            p.Schema = info.Schema;
            p.Model = info.Model;
            p.ModelId = info.ModelId;
            return p;
        }

        internal static Process GetProcessFromContext(WorkflowDataContext DataContext)
        {
            var pi = DataContext.GetProperties()["Process"];
            var process = pi.GetValue(DataContext) as Process;
            return process;
        }

        internal void Start(IDbContext dbContext)
        {
            dbContext.Execute<Process>(null, "a2workflow.[Process.Create]", this);
            if (this.Id == 0)
                throw new WorkflowException("Failed to start process");
        }

        private IDataModel _model = null;

        IDataModel GetModel()
        {
            IDbContext dbContext = ServiceLocator.Current.GetService<IDbContext>();
            if (_model != null)
                return _model;
            String proc = $"[{this.Schema}].[{this.Model}.Load]";
            ExpandoObject loadPrms = new ExpandoObject();
            loadPrms.Set("Id", ModelId);
            _model = dbContext.LoadModel(String.Empty, proc, loadPrms);
            return _model;
        }
    }
}
