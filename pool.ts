import * as Connection from './connection'
import type S from '@appliedblockchain/tsql/sanitised'

export type Pool = {
  create: () => Promise<Connection.t>,
  connections: Connection.t[],
  rows: <T = unknown>(tsa: TemplateStringsArray, ...rest: unknown[]) => Promise<T[]>
}

export type t = Pool

export const aquire =
  (pool: Pool): Promise<Connection.t> =>
    pool.connections.length ?
      Promise.resolve(pool.connections.pop() as Connection.t) :
      pool.create()

export const release =
  (pool: Pool, connection: Connection.t): void => {
    pool.connections.push(connection)
  }

// TODO: Handle in-flight connections.
export const close =
  (pool: Pool): void =>
    pool.connections.forEach(Connection.close)

export const ofUrl =
  (url?: undefined | string): Pool => ({
    create: () => Connection.ofUrl(url),
    connections: [],
    async rows<T = unknown>(tsa: S | TemplateStringsArray, ...rest: unknown[]) {
      const connection = await aquire(this)
      try {
        return connection.rows<T>(tsa, ...rest)
      } finally {
        release(this, connection)
      }
    }
  })
