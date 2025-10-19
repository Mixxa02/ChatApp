using System.Data.Common;
using StackExchange.Redis;

public class RedisConnection : IDisposable
{
    private IDatabase db;
    private ConnectionMultiplexer cmp;
    public RedisConnection(string ip)
    {
        cmp = ConnectionMultiplexer.Connect(ip);
        db = cmp.GetDatabase();
    }

    public IDatabase GetDatabase()
    {
        return db;
    }

    public ConnectionMultiplexer GetMultiplexer()
    {
        return cmp;
    }

    public void Dispose()
    {
        cmp.Dispose();
    }
}