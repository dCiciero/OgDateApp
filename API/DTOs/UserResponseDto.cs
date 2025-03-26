using System;

namespace API.DTOs;

public class UserResponseDto
{
    public required string UserName { get; set; }
    public required string KnownAs { get; set; }
    public required string Token { get; set; }
    public required string Gender { get; set; }
    public string? PhotoUrl { get; set; }
}
