
using System.Text.Json;
using System.Threading.Channels;
using ChatApp.Hubs;
using Microsoft.AspNetCore.SignalR;
using StackExchange.Redis;


public class RedisNotificationService : BackgroundService
{
    private ChannelMessageQueue? channel;
    private readonly IHubContext<ChatHub> chatHub;
    private ConnectionMultiplexer mux;
    private RedisValue lastMessageId;
    private IDatabase database;
    public RedisNotificationService(IHubContext<ChatHub> ch, RedisConnection rc)
    {
        chatHub = ch;
        mux = rc.GetMultiplexer();
        database = mux.GetDatabase();
        if(!database.KeyExists("send"))
        {
            lastMessageId = 0;
        }
        else
        {
            var stream = database.StreamInfo("send");
            lastMessageId = stream.LastEntry.Id;
        }
    }
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {

        var sub = mux.GetSubscriber().Subscribe("sendPubSub");
        sub.OnMessage(async (message)=>{
            // await database.StreamAddAsync("send", "message", message.Message);
            var msds = JsonSerializer.Deserialize<Message>(message.Message.ToString());
            await chatHub.Clients.Group(msds!.RoomName).SendAsync("ReceiveMessage",msds);
            //All.SendAsync("ReceiveMessage", msds.user, msds.text, msds.time);
        });

        //var messages = database.StreamReadAsync("sendPubSub", "0-0");

        // 
        await Task.CompletedTask;
    }
}