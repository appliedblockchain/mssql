import type { ConnectionConfig } from 'tedious'
import { parse as parseUrl } from 'url'
import { inspect } from 'util'

const configOfUrl =
  (url?: undefined | string): ConnectionConfig => {
    const { protocol, auth, hostname, port: port_, pathname } = url ?
      parseUrl(url) :
      { protocol: 'mssql:', auth: undefined, hostname: undefined, port: undefined, pathname: undefined }
    if (protocol !== 'mssql:') {
      throw new Error(`Expected mssql protocol, got ${inspect(protocol)}.`)
    }
    const [ userName, password ] = auth ?
      auth.split(':') :
      [ 'sa', 'yourStrong(!)Password' ]
    const server = hostname ?? 'localhost'
    const database = pathname ? pathname.slice(1) : 'master'
    const port = port_ ? parseInt(port_, 10) : 1433
    return {
      server,
      options: {
        port,
        database,
        trustServerCertificate: true,
        rowCollectionOnDone: true,
        rowCollectionOnRequestCompletion: true
      },
      authentication: { type: 'default', options: { userName, password } }
    }
  }

export default configOfUrl
