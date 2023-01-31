import { Router, Request, Response } from "express";
import { query, QueryArg } from "./query";

function createModel(entity: string) {
  return {
    async getAll() {
      const sql = `SELECT * FROM ${entity}`;
      return query(sql);
    },
    async getOne(id: number | string) {
      const sql = `SELECT * FROM ${entity} WHERE id = ?`;
      const [record] = await query(sql, id);
      return record;
    },
    async create(fields: object) {
      const keys = Object.keys(fields);
      const keysStr = keys.join(", ");
      const placeholders = new Array(keys.length).fill("?").join(", ");
      const values = Object.values(fields) as QueryArg[];
      const sqlInsert = `INSERT INTO ${entity} (${keysStr}) VALUES (${placeholders})`;
      await query(sqlInsert, ...values);
      const sqlSelect = `SELECT * FROM ${entity} ORDER BY id DESC LIMIT 1`;
      const [latest] = await query(sqlSelect);
      return latest;
    },
    async updateOne(id: number | string, fields: object) {
      const updates = Object.keys(fields)
        .map((k) => `${k} = ?`)
        .join(", ");
      const sqlUpdate = `UPDATE ${entity} SET ${updates} WHERE id = ?`;
      const args = [...Object.values(fields), id];
      await query(sqlUpdate, ...args);
      return this.getOne(id);
    },
    async deleteOne(id: number | string): Promise<void> {
      const sqlDelete = `DELETE FROM ${entity} WHERE id = ?`;
      await query(sqlDelete, id);
    },
  };
}

function createApiRouter(entity: string) {
  const model = createModel(entity);

  async function getAll(req: Request, res: Response) {
    try {
      const records = await model.getAll();
      res.send(records);
    } catch (err) {
      res.send({ error: (err as Error).message });
    }
  }

  async function getOne(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const record = await model.getOne(id);
      if (!record) {
        throw new Error("Not Found");
      }
      res.send(record);
    } catch (err) {
      res.send({ error: (err as Error).message });
    }
  }

  async function putOne(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const record = await model.updateOne(id, req.body);
      if (!record) {
        throw new Error("Not Found");
      }
      res.send(record);
    } catch (err) {
      res.send({ error: (err as Error).message });
    }
  }

  async function postOne(req: Request, res: Response) {
    try {
      const record = await model.create(req.body);
      if (!record) {
        throw new Error("Not Found");
      }
      res.send(record);
    } catch (err) {
      res.send({ error: (err as Error).message });
    }
  }

  async function deleteOne(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await model.deleteOne(id);
      res.sendStatus(204);
    } catch (err) {
      res.send({ error: (err as Error).message });
    }
  }

  const router = Router();
  router
    .get("/", getAll)
    .post("/", postOne)
    .get("/:id", getOne)
    .put("/:id", putOne)
    .delete("/:id", deleteOne);
  return router;
}

export default createApiRouter;
