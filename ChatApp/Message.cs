using System.Diagnostics.CodeAnalysis;

public class Message{
    public required string text { get; set; }
    public string image { get; set; }
    public required string user { get; set; }
    public required DateTime time { get; set; }
    public string RoomName { get; set; }

    [SetsRequiredMembers]
    public Message(string text, string image, string user, DateTime time, string roomName)
    {
        this.text = text;
        this.image = image;
        this.user = user;
        this.time = time;
        this.RoomName = roomName;
    }
}