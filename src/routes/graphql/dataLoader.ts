import { Post, PrismaClient, Profile, User } from '@prisma/client';
import DataLoader from 'dataloader';

export const dataLoader = (prisma: PrismaClient) => ({
  profile: new DataLoader(async (ids) => {
    const profileIds = ids as string[];

    const profiles = await prisma.profile.findMany({ where: { id: { in: profileIds } } });

    const profileMap = new Map<string, Profile>(
      profiles.map((profile) => [profile.id, profile]),
    );
    return profileIds.map((profileId) => profileMap.get(profileId));
  }),

  profilesByMemberType: new DataLoader(async (ids) => {
    const memberTypeIds = ids as string[];

    const profiles = await prisma.profile.findMany({
      where: { memberTypeId: { in: memberTypeIds } },
    });

    const profilesMap: Map<string, Profile[]> = new Map();
    profiles.forEach((profile) => {
      const existingProfile = profilesMap.get(profile.memberTypeId);

      if (!existingProfile) {
        profilesMap.set(profile.memberTypeId, [profile]);
      } else {
        existingProfile.push(profile);
      }
    });

    return memberTypeIds.map((memberTypeId) => profilesMap.get(memberTypeId) || []);
  }),

  profileByUserId: new DataLoader(async (ids) => {
    const userIds = ids as string[];

    const profiles = await prisma.profile.findMany({
      where: { userId: { in: userIds } },
    });
    const profileMap = new Map(profiles.map((profile) => [profile.userId, profile]));

    return userIds.map((userId) => profileMap.get(userId));
  }),

  post: new DataLoader(async (ids) => {
    const postIds = ids as string[];

    const posts = await prisma.post.findMany({ where: { id: { in: postIds } } });
    const postMap = new Map<string, Post>(posts.map((post) => [post.id, post]));

    return postIds.map((id) => postMap.get(id));
  }),

  postsByUserId: new DataLoader(async (ids) => {
    const userIds = ids as string[];

    const posts = await prisma.post.findMany({ where: { authorId: { in: userIds } } });

    const postsMap: Map<string, Post[]> = new Map();
    posts.forEach((post) => {
      const existingPosts = postsMap.get(post.authorId);

      if (!existingPosts) {
        postsMap.set(post.authorId, [post]);
      } else {
        existingPosts.push(post);
      }
    });

    return userIds.map((userId) => postsMap.get(userId) || []);
  }),

  memberType: new DataLoader(async (ids) => {
    const memberTypeIds = ids as string[];

    const memberTypes = await prisma.memberType.findMany({
      where: { id: { in: memberTypeIds } },
    });
    const memberTypeMap = new Map(
      memberTypes.map((memberType) => [memberType.id, memberType]),
    );

    return memberTypeIds.map((memberTypeId) => memberTypeMap.get(memberTypeId));
  }),

  user: new DataLoader(async (ids) => {
    const userIds = ids as string[];

    const users = await prisma.user.findMany({ where: { id: { in: userIds } } });
    const userMap = new Map<string, User>(users.map((user) => [user.id, user]));

    return userIds.map((id) => userMap.get(id));
  }),

  userSubscribedTo: new DataLoader<string, User[]>(async (ids) => {
    const subscriberIds = ids as string[];

    const users = await prisma.user.findMany({
      where: {
        subscribedToUser: {
          some: {
            subscriberId: { in: subscriberIds },
          },
        },
      },
      include: {
        subscribedToUser: true,
      },
    });

    const userMap: Map<string, User[]> = new Map();
    users.forEach((user) => {
      user.subscribedToUser.forEach((subscription) => {
        const existingSub = userMap.get(subscription.subscriberId);

        if (!existingSub) {
          userMap.set(subscription.subscriberId, [user]);
        } else {
          existingSub.push(user);
        }
      });
    });

    return subscriberIds.map((subscriberId) => userMap.get(subscriberId) || []);
  }),

  subscribedToUser: new DataLoader<string, User[]>(async (ids) => {
    const authorIds = ids as string[];

    const users = await prisma.user.findMany({
      where: {
        userSubscribedTo: {
          some: {
            authorId: { in: authorIds },
          },
        },
      },
      include: {
        userSubscribedTo: true,
      },
    });

    const userMap: Map<string, User[]> = new Map();
    users.forEach((user) => {
      user.userSubscribedTo.forEach((sub) => {
        const existingUsers = userMap.get(sub.authorId);

        if (!existingUsers) {
          userMap.set(sub.authorId, [user]);
        } else {
          existingUsers.push(user);
        }
      });
    });

    return authorIds.map((authorId) => userMap.get(authorId) || []);
  }),
});

export type DataLoaderType = ReturnType<typeof dataLoader>;
