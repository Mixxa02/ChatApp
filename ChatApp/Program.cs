using ChatApp.Hubs;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);
var redisCon = new RedisConnection("127.0.0.1");


// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddHostedService<RedisNotificationService>();
builder.Services.AddSignalR();
builder.Services.Configure<HubOptions>(options => {
    options.MaximumReceiveMessageSize = null;
});

builder.Services.AddSingleton<RedisConnection>(redisCon);
var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();
app.MapHub<ChatHub>("/chatHub");

app.Run();
