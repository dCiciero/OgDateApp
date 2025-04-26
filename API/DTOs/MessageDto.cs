using System;

namespace API.DTOs;

public class MessageDto
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public required string SenderUsername { get; set; } = null!;
    public required string SenderPhotoUrl { get; set; } = null!;
    public int RecipientId { get; set; }
    public required string RecipientUsername { get; set; } = null!;
    public required string RecipientPhotoUrl { get; set; } = null!;
    public required string Content { get; set; } = null!;
    public DateTime? DateRead { get; set; } = null;
    public DateTime MessageSent { get; set; }
}
