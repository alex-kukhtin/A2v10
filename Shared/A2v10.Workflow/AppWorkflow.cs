
using System;
using System.Collections.Generic;
using System.Threading;
using System.Activities;
using System.Activities.DurableInstancing;
using System.Runtime.DurableInstancing;

using Microsoft.Activities.Extensions.Tracking;

using A2v10.Infrastructure;
using System.Activities.Tracking;
using System.Threading.Tasks;

namespace A2v10.Workflow
{
    public class AppWorkflow
    {
        private WorkflowApplication _application;
        private static TimeSpan _wfTimeSpan = TimeSpan.FromSeconds(30);
        private ManualResetEvent _endEvent = new ManualResetEvent(false);
        private const Int32 RUNNABLE_INSTANCES_DETECTION_PERIOD = 10;

        private StateMachineStateTracker _tracker;
        private IList<TrackInfo> _trackingRecords;

        private Exception _unhandledException;

        IDbContext _dbContext;

        public static Int64 StartWorkflow(IApplicationHost host, IDbContext dbContext, StartWorkflowInfo info)
        {
            AppWorkflow aw = null;
            try
            {
                var def = WorkflowDefinition.Create(info.Source);
                Activity root = def.LoadFromSource(host);
                Process process = Process.Create(def, info);
                // workflow arguments
                IDictionary<String, Object> args = new Dictionary<String, Object>();
                args.Add("Process", process);
                aw = Create(dbContext, root, args, def.Identity);
                process.WorkflowId = aw._application.Id;
                process.Start(dbContext);
                aw._application.Run(_wfTimeSpan);
                return process.Id;
            }
            catch (Exception ex)
            {
                if (!CatchWorkflow(aw, ex))
                    throw;
                return 0;
            }
            finally
            {
                ProcessFinally(aw);
            }
        }

        public static void ResumeWorkflow()
        {
            AppWorkflow aw = null;
            try
            {
                String assemblyName = String.Empty;
                String typeName = String.Empty;
                Activity root = System.Activator.CreateInstance(assemblyName, typeName).Unwrap() as Activity;
                foreach (var bm in aw._application.GetBookmarks())
                {
                    if (bm.BookmarkName == "TODO" /*inboxInfo.Bookmark*/)
                    {
                        var rr = new RequestResult();
                        aw._application.ResumeBookmark(bm.BookmarkName, rr);
                        return; // already resumed
                    }
                }
                // if a bookmark is not found
                aw._application.Unload();
            }
            catch (Exception ex)
            {
                if (!CatchWorkflow(aw, ex))
                    throw;
            }
            finally
            {
                ProcessFinally(aw);
            }
        }

        internal void Track(TrackingRecord record)
        {
            if (_trackingRecords == null)
                _trackingRecords = new List<TrackInfo>();
            var ti = new TrackInfo(record);
            if (_tracker != null)
            {
                ti.State = _tracker.CurrentState;
            }
            _trackingRecords.Add(ti);
        }

        static AppWorkflow Create(IDbContext dbContext, Activity root, IDictionary<String, Object> args, WorkflowIdentity identity)
        {
            var aw = new AppWorkflow();
            var store = aw.CreateInstanceStore(dbContext.ConnectionString(null));
            if (args == null)
                aw._application = new WorkflowApplication(root, identity);
            else
                aw._application = new WorkflowApplication(root, args, identity);
            aw.SetApplicationHandlers();
            aw._dbContext = dbContext;
            aw._tracker = StateMachineStateTracker.Attach(aw._application);
            aw._application.Extensions.Add(new WorkflowTracker(aw));
            aw._application.Extensions.Add(dbContext);
            aw._application.InstanceStore = store;
            return aw;
        }

        static bool CatchWorkflow(AppWorkflow aw, Exception ex)
        {
            if ((aw != null) && (aw._application != null))
                aw._application.Unload();
            if (ex.InnerException != null)
                throw ex.InnerException;
            else
                return false;
        }

        static void ProcessFinally(AppWorkflow aw /*,IProfiler profiler*/)
        {
            if (aw == null)
                return;
            aw._endEvent.WaitOne(_wfTimeSpan);
            if (aw._unhandledException != null)
            {
                if (aw._unhandledException.InnerException != null)
                    throw aw._unhandledException.InnerException;
                throw aw._unhandledException;
            }
            if (aw._application.InstanceStore != null)
                aw._application.InstanceStore.DefaultInstanceOwner = null;
            aw.WriteTrackingRecords();
            //TODO:if (profiler != null)
                //profiler.EndWorkflow(aw._token);
        }


        void WriteTrackingRecords()
        {
            if ((_trackingRecords == null) || (_trackingRecords.Count == 0))
                return;
            try
            {
                var prm = new
                {
                    InstanceId = _application.Id
                };
                _dbContext.SaveList<TrackInfo>(null, "[a2workflow].[WriteLog]", prm, _trackingRecords);
            }
            catch (Exception /*ex*/)
            {
                // eat all ?
            }
        }

        void SetApplicationHandlers()
        {
            _application.PersistableIdle = (e) =>
            {
                RefreshWorkflowState();
                return PersistableIdleAction.Unload;
            };
            _application.Completed = (e) =>
            {
                RefreshWorkflowState();
                _endEvent.Set();
            };
            _application.Unloaded = (e) =>
            {
                /* state is already unloaded in PersistableIdle */
                _endEvent.Set();
            };
            _application.Aborted = (e) =>
            {
                _unhandledException = e.Reason;
                WriteTrackingRecords();
                RefreshWorkflowState();
                _endEvent.Set();
            };
            _application.OnUnhandledException = (e) =>
            {
                _unhandledException = e.UnhandledException;
                WriteTrackingRecords();
                RefreshWorkflowState();
                _endEvent.Set();
                return UnhandledExceptionAction.Terminate;
            };
        }

        void RefreshWorkflowState()
        {
            // Nothing to do is not necessary.
            // Everything is saved in the TrackingRecord.
        }

         SqlWorkflowInstanceStore CreateInstanceStore(String cnnString)
        {
            String cnnStr = cnnString;
            if (cnnStr.IndexOf("Asynchronous Processing") == -1)
                cnnStr += ";Asynchronous Processing=True";
            var _store = new SqlWorkflowInstanceStore(cnnStr);
            _store.InstanceLockedExceptionAction = InstanceLockedExceptionAction.AggressiveRetry;
            _store.HostLockRenewalPeriod = _wfTimeSpan;
            _store.RunnableInstancesDetectionPeriod = TimeSpan.FromSeconds(RUNNABLE_INSTANCES_DETECTION_PERIOD);
            _store.InstanceCompletionAction = InstanceCompletionAction.DeleteNothing;
            InstanceHandle handle = _store.CreateInstanceHandle();
            InstanceView view = _store.Execute(handle, new CreateWorkflowOwnerCommand(), _wfTimeSpan);
            _store.DefaultInstanceOwner = view.InstanceOwner;
            handle.Free();
            return _store;
        }
    }
}
