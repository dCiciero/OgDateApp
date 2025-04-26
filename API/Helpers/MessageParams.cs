using System;

namespace API.Helpers;

public class MessageParams : PaginationParams
{
    public string Container { get; set; } = "Unread";
    public string Username { get; set; } = string.Empty;
    public int UserId { get; set; } = 0;
    public int RecipientId { get; set; } = 0;
}
