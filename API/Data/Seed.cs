using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class Seed
{
    public static async Task SeedUsers(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager)
    {
        if (await userManager.Users.AnyAsync()) return;

        var userData = await File.ReadAllTextAsync("Data/UserSeedData.json");

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var users = JsonSerializer.Deserialize<List<AppUser>>(userData, options);

        if (users == null || users.Count == 0)
        {
            Console.WriteLine("No users to seed.");
            return;
        }

        var roles = new List<AppRole> { 
            new () { Name = "Member" },
            new () { Name = "Admin" },
            new () { Name = "Moderator" }
        };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role.Name!))
            {
                await roleManager.CreateAsync(role);
            }
        }
        foreach (var user in users)
        {
            user.UserName = user.UserName!.ToLower();

            var result = await userManager.CreateAsync(user, "Pa$$w0rd");

            if (!result.Succeeded)
            {
                Console.WriteLine($"Failed to create user {user.UserName}:");
                foreach (var error in result.Errors)
                    Console.WriteLine($" - {error.Description}");
            }
            await userManager.AddToRoleAsync(user, "Member");
        }

        var adminUser = new AppUser
        {
            UserName = "admin",
            KnownAs = "Admin",
            Gender = "",
            City = "Admin City",
            Country = "Admin Country"
        };
        var resultAdmin = await userManager.CreateAsync(adminUser, "Pa$$w0rd");
        if (resultAdmin.Succeeded)
        {
            await userManager.AddToRolesAsync(adminUser, new[] { "Admin", "Moderator" });
        }
        else
        {
            Console.WriteLine($"Failed to create admin user:");
            foreach (var error in resultAdmin.Errors)
                Console.WriteLine($" - {error.Description}");
        }

        Console.WriteLine($"Seeded {users.Count} users.");
    }
} 
