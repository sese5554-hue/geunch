import { Router } from 'express';
import type { Pool } from 'mariadb';
import { searchSchema, type Search, type Vehicle } from '../shared/vehicles';
export interface VehicleStore { search(conditions: Search): Promise<Vehicle[]> }
const literal = (value: string) => '%' + value.replace(/[!%_]/g, value => '!' + value) + '%';
export class MariaVehicles implements VehicleStore {
  constructor(private pool: Pool) {}
  async search(conditions: Search): Promise<Vehicle[]> {
    const filters = ["status='PUBLISHED'", "neighborhood LIKE ? ESCAPE '!'", "name LIKE ? ESCAPE '!'"];
    const values: (string | number)[] = [literal(conditions.neighborhood), literal(conditions.q)];
    if (conditions.maxPrice !== undefined) { filters.push('daily_price<=?'); values.push(conditions.maxPrice); }
    const rows = await this.pool.query(`SELECT id,name,year,neighborhood,fuel,seats,daily_price FROM vehicles WHERE ${filters.join(' AND ')} ORDER BY daily_price,id LIMIT 100`, values);
    return rows.map((row: Record<string, any>) => ({ id: row.id, name: row.name, year: row.year, neighborhood: row.neighborhood, fuel: row.fuel, seats: row.seats, dailyPrice: row.daily_price }));
  }
}
export function vehicleRoutes(store?: VehicleStore) {
  const routes = Router();
  routes.get('/vehicles', async (req, res) => {
    const parsed = searchSchema.safeParse(req.query);
    if (!parsed.success) { res.status(400).json({ message: parsed.error.issues[0].message }); return; }
    if (!store) { res.status(503).json({ message: '차량 목록을 불러올 수 없습니다. 다시 시도해 주세요.' }); return; }
    res.setHeader('Cache-Control', 'no-store');
    res.json(await store.search(parsed.data));
  });
  return routes;
}
