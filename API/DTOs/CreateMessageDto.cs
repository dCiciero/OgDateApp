using System;

namespace API.DTOs;

public class CreateMessageDto
{
    public required string RecipientUsername { get; set; } = null!;
    public required string Content { get; set; } = null!;
}
