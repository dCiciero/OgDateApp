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
    public void AddMessage(Message message)
    {
        dataContext.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
        dataContext.Messages.Remove(message);
    }

    public async Task<Message?> GetMessage(int id)
    {
        return await dataContext.Messages.FindAsync(id);
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
            .Include(m => m.Sender).ThenInclude(s => s.Photos)
            .Include(m => m.Recipient).ThenInclude(r => r.Photos)
            .Where(m => 
                m.Recipient.UserName == currentUsername 
                    && m.Sender.UserName == recipientUsername 
                    && m.RecipientDeleted == false ||
                m.Recipient.UserName == recipientUsername 
                    && m.Sender.UserName == currentUsername 
                    && m.SenderDeleted == false
            )
            .OrderBy(m => m.MessageSent)
            .ToListAsync();

        var unreadMessages = messages.Where(m => m.DateRead == null && m.Recipient.UserName == currentUsername).ToList();
        if (unreadMessages.Any())
        {
            unreadMessages.ForEach(m => m.DateRead = DateTime.UtcNow);
            await dataContext.SaveChangesAsync();
            // foreach (var message in unreadMessages)
            // {
            //     message.DateRead = DateTime.UtcNow;
            // }

        }
        return mapper.Map<IEnumerable<MessageDto>>(messages); 
    }

    public async Task<bool> SaveAllAsync()
    {
        return await dataContext.SaveChangesAsync() > 0;
    }
}
