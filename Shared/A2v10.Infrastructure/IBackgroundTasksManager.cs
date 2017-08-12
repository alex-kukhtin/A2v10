using System;

namespace A2v10.Infrastructure
{
    public interface IBackgroundTasksManager : IDisposable
    {
        void Start();
        void ScheduleBackgroundTask(Action action);
        void ScheduleBackgroundTask(Action action, TimeSpan interval, DateTime timeToRun);
        void StartTasksFromConfig();

        IDbContext DbContext { get; }
    }
}
