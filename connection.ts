import { Connection as TediousConnection, Request } from 'tedious'
import configOfUrl from './config-of-url'
import tsql from '@appliedblockchain/tsql'
import S from '@appliedblockchain/tsql/sanitised'

export type Connection = {
  tediousConnection: TediousConnection,
  rows: <T = unknown>(tsa: S | TemplateStringsArray, ...rest: unknown[]) => Promise<T[]>
}

export type t = Connection

const sqlOfTsa =
  (tsa: S | TemplateStringsArray, ...rest: unknown[]): string =>
    tsa instanceof S ?
      tsa.toString() :
      tsql(tsa, ...rest).toString()

const rows =
  <T = unknown>(connection: Connection, tsa: S | TemplateStringsArray, ...rest: unknown[]): Promise<T[]> => {
    const sql = sqlOfTsa(tsa, ...rest)
    return new Promise((resolve, reject) => {
      const request = new Request(sql, (err, _rowCount, rows_) => {
        err ? reject(err) : resolve(rows_)
      })
      connection.tediousConnection.execSql(request)
    })
  }

export const ofUrl =
  async (url?: undefined | string): Promise<Connection> => {
    const tediousConnection = new TediousConnection(configOfUrl(url))
    return new Promise((resolve, reject) => {
      const connection: Connection = {
        tediousConnection,
        rows<T = unknown>(tsa: S | TemplateStringsArray, ...rest: unknown[]) {
          return rows<T>(this, tsa, ...rest)
        }
      }
      tediousConnection.connect(err => err ? reject(err) : resolve(connection))
    })
  }

export const close =
  (connection: Connection): void =>
    connection.tediousConnection.close()
