import RedisClient from 'ioredis'
import MessagePack from 'msgpack-lite'


export class StateManager {
    private redis: import('ioredis').Redis
    public constructor () {
      this.redis = new RedisClient(parseInt(process.env.REDIS_PORT || '32769'), process.env.REDIS_HOST || 'localhost', { db: 5 })
    }

    public async ConnectionSetAndGet (player: string, newState: import('./ConnectionState').ConnectionState): Promise<import('./ConnectionState').ConnectionState> {
      await this.redis.set(`${player}-connectionState`, MessagePack.encode(newState))
      return newState
    }

    public async ConnectionSet (player: string, newState: import('./ConnectionState').ConnectionState): Promise<void> {
      await this.redis.set(`${player}-connectionState`, MessagePack.encode(newState))
    }

    public async ConnectionGet (player: string): Promise<import('./ConnectionState').ConnectionState> {
      const state = await this.redis.getBuffer(`${player}-connectionState`)
      if (state !== null) { return <import('./ConnectionState').ConnectionState>MessagePack.decode(state) }
      return null
    }

    public async ConnectionSetConnectionTimeout (player: string, time: number, key: string) {
      if (await this.ConnectionHas(player)) {
        this.redis.expire(`${player}-connectionState`, time / 1000)
        this.redis.set(`${key}-resume`, player, 'EX', time / 1000)
      }
    }

    public async ConnectionRemoveTimeout (key: string): Promise<string> {
      const resume = await this.redis.get(`${key}-resume`)
      if (!resume) return null
      const session = await this.ConnectionGet(resume)
      if (!session) return null
      await this.redis.del(`${key}-resume`)
      await this.redis.persist(`${resume}-connectionState`)
      return resume
    }

    public async ConnectionHas (player: string): Promise<boolean> {
      return (await this.redis.keys(`${player}-connectionState`)).length > 0
    }

    public async PlayerGet (target: string): Promise<import('./PlayerState').PlayerState> {
      const state = await this.redis.getBuffer(`${target}-player`)
      return <import('./PlayerState').PlayerState>MessagePack.decode(state)
    }

    public async PlayerSet (target: string, newState: import('./PlayerState').PlayerState): Promise<void> {
      await this.redis.set(`${target}-player`, MessagePack.encode(newState))
    }

    public async PlayerDelete (target: string): Promise<void> {
      await this.redis.del(target)
    }
}
