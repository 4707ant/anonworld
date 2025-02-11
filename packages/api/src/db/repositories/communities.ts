import { drizzle } from 'drizzle-orm/node-postgres'
import {
  communitiesTable,
  farcasterAccountsTable,
  tokensTable,
  twitterAccountsTable,
} from '../schema'
import { eq, inArray, or } from 'drizzle-orm'
import { DBCommunity, DBToken } from '../types'
import { FarcasterUser, TwitterUser } from '@anonworld/common'

type Community = DBCommunity & {
  token: DBToken | null
  farcaster: FarcasterUser | null
  twitter: TwitterUser | null
}

export class CommunitiesRepository {
  private db: ReturnType<typeof drizzle>

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db
  }

  async get(id: string) {
    const [community] = await this.db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.id, id))
      .leftJoin(tokensTable, eq(communitiesTable.token_id, tokensTable.id))
      .leftJoin(
        farcasterAccountsTable,
        eq(communitiesTable.fid, farcasterAccountsTable.fid)
      )
      .leftJoin(
        twitterAccountsTable,
        eq(communitiesTable.twitter_username, twitterAccountsTable.username)
      )
      .limit(1)

    return {
      ...community.communities,
      token: community.tokens,
      farcaster: community.farcaster_accounts?.metadata as FarcasterUser | null,
      twitter: community.twitter_accounts?.metadata as TwitterUser | null,
    } as Community
  }

  async getForAccounts(fids: number[], usernames: string[]) {
    const response = await this.db
      .select()
      .from(communitiesTable)
      .where(
        or(
          inArray(communitiesTable.fid, fids),
          inArray(communitiesTable.twitter_username, usernames)
        )
      )

    return response as DBCommunity[]
  }

  async list() {
    const communities = await this.db
      .select()
      .from(communitiesTable)
      .leftJoin(tokensTable, eq(communitiesTable.token_id, tokensTable.id))
      .leftJoin(
        farcasterAccountsTable,
        eq(communitiesTable.fid, farcasterAccountsTable.fid)
      )
      .leftJoin(
        twitterAccountsTable,
        eq(communitiesTable.twitter_username, twitterAccountsTable.username)
      )
    return communities.map((community) => ({
      ...community.communities,
      token: community.tokens,
      farcaster: community.farcaster_accounts?.metadata as FarcasterUser | null,
      twitter: community.twitter_accounts?.metadata as TwitterUser | null,
    })) as Community[]
  }

  async update(
    communityId: string,
    params: Partial<typeof communitiesTable.$inferInsert>
  ) {
    await this.db
      .update(communitiesTable)
      .set(params)
      .where(eq(communitiesTable.id, communityId))
  }
}
