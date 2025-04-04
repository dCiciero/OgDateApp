using System;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Repositories;

public class LikesRepository(DataContext dataContext, IMapper mapper) : ILikesRepository
{
    public void AddLike(UserLike like)
    {
        dataContext.Likes.Add(like);
    }

    public void DeleteLike(UserLike like)
    {
        dataContext.Likes.Remove(like);
    }

    public async Task<IEnumerable<int>> GetCurrentUserLikeIds(int currentUserId)
    {
        return await dataContext.Likes
            .Where(x => x.SourceUserId == currentUserId)
            .Select(x => x.TargetUserId)
            .ToListAsync();
    }

    public async Task<UserLike?> GetUserLike(int sourceUserId, int targetUserId)
    {
        return await dataContext.Likes.FindAsync(sourceUserId, targetUserId);
    }

    public async Task<PagedList<MemberDto>> GetUserLikes(LikesParam likesParam )
    {
        var likes = dataContext.Likes.AsQueryable();
        IQueryable<MemberDto> query;

        switch (likesParam.Predicate)
        {
            case "liked":
                query = likes
                    .Where(x => x.SourceUserId == likesParam.UserId)
                    .Select(x=> x.TargetUser)
                    .ProjectTo<MemberDto>(mapper.ConfigurationProvider);
                    // .ToListAsync();
                break;
            case "likedBy":
                query = likes
                    .Where(x => x.TargetUserId == likesParam.UserId)
                    .Select(x=> x.SourceUser)
                    .ProjectTo<MemberDto>(mapper.ConfigurationProvider);
                break;
            default:
                var likedIds = await GetCurrentUserLikeIds(likesParam.UserId);

                query = likes
                    .Where(x => x.TargetUserId == likesParam.UserId && likedIds.Contains(x.SourceUserId))
                    .Select(x => x.SourceUser)
                    .ProjectTo<MemberDto>(mapper.ConfigurationProvider);
                    
                break;
        }

        return await PagedList<MemberDto>.CreateAsync(query, likesParam.PageNumber, likesParam.PageSize);
    }

    public async Task<bool> SaveChanges()
    {
        return await dataContext.SaveChangesAsync() > 0;
    }
}
