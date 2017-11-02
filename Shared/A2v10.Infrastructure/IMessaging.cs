using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
    public interface IMessaging
    {
        IMessage CreateMessage();
        void QueueMessage(IMessage message);
    }
}
