// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using A2v10.Data.Interfaces;
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
