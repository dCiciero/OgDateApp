using System;
using System.Security.Claims;

namespace API.Extensions;

public static class ClaimsPrincipleExtension
{
    public static string GetUsername(this ClaimsPrincipal user)
    {
        var username = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new Exception("Username not found");
        return username;
    }
}
