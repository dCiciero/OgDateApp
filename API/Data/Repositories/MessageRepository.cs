using System;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Repositories;

public class MessageRepository(DataContext dataContext, IMapper mapper) : IMessageRepository
{
    public void AddGroup(Group group)
    {
        dataContext.Groups.Add(group);
    }

    public void AddMessage(Message message)
    {
        dataContext.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
        dataContext.Messages.Remove(message);
    }

    public async Task<Connection?> GetConnection(string connectionId)
    {
        return await dataContext.Connections.FindAsync(connectionId);
    }

    public async Task<Group?> GetGroupForConnection(string connectionId)
    {
        return await dataContext.Groups
            .Include(g => g.Connections)
            .FirstOrDefaultAsync(g => g.Connections.Any(c => c.ConnectionId == connectionId));
    }

    public async Task<Message?> GetMessage(int id)
    {
        return await dataContext.Messages.FindAsync(id);
    }

    public async Task<Group?> GetMessageGroup(string groupName)
    {
        var messageGroup = await dataContext.Groups
            .Include(g => g.Connections)
            .FirstOrDefaultAsync(g => g.Name == groupName);
        return messageGroup ?? null;
    }

    public Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
    {
        var query = dataContext.Messages
            .OrderByDescending(m => m.MessageSent)
            .AsQueryable();


        query = messageParams.Container switch
        {
            "Inbox" => query.Where(m => m.Recipient.UserName == messageParams.Username && m.RecipientDeleted == false),
            "Outbox" => query.Where(m => m.Sender.UserName == messageParams.Username && m.SenderDeleted == false),
            _ => query.Where(m => m.Recipient.UserName == messageParams.Username && m.RecipientDeleted == false && m.DateRead == null)
        };

        var messages = query.ProjectTo<MessageDto>(mapper.ConfigurationProvider);

        return PagedList<MessageDto>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);
    }

    public async Task<IEnumerable<MessageDto>> GetMessagesThread(string currentUsername, string recipientUsername)
    {
        var messages = await dataContext.Messages
            // .Include(m => m.Sender).ThenInclude(s => s.Photos)
            // .Include(m => m.Recipient).ThenInclude(r => r.Photos)
            .Where(m =>
                m.Recipient.UserName == currentUsername
                    && m.Sender.UserName == recipientUsername
                    && m.RecipientDeleted == false ||
                m.Recipient.UserName == recipientUsername
                    && m.Sender.UserName == currentUsername
                    && m.SenderDeleted == false
            )
            .OrderBy(m => m.MessageSent)
            .ProjectTo<MessageDto>(mapper.ConfigurationProvider)
            .ToListAsync();

        var unreadMessages = messages.Where(m => m.DateRead == null && m.RecipientUsername == currentUsername).ToList();
        if (unreadMessages.Count != 0)
        {
            unreadMessages.ForEach(m => m.DateRead = DateTime.UtcNow);
            await dataContext.SaveChangesAsync();
            // foreach (var message in unreadMessages)
            // {
            //     message.DateRead = DateTime.UtcNow;
            // }

        }
        return messages;  // mapper.Map<IEnumerable<MessageDto>>(messages); 
    }

    public void RemoveConnection(Connection connection)
    {
        dataContext.Connections.Remove(connection);
    }

    public async Task<bool> SaveAllAsync()
    {
        return await dataContext.SaveChangesAsync() > 0;
    }
}
