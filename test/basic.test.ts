import * as Pool from '../pool'

let pool: Pool.t

beforeAll(async () => {
  pool = await Pool.ofUrl()
})

test('42', async () => {
  await expect(pool.rows`select 42`).resolves.toMatchObject([ [ { value: 42 } ] ])
})

afterAll(async () => {
  if (pool) {
    Pool.close(pool)
  }
})
