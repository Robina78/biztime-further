// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const testCompany = require('./companies.test')

let testInvoice;
beforeEach(async () => {
  const result = await db.query(
      `INSERT INTO invoices (comp_code, amt, paid, paid_date) 
       VALUES (${testCompany.code}, 300, false, null) 
       RETURNING  id, comp_code, amt, paid, paid_date`);
  testInvoice = result.rows[0]
});

afterEach(async () => {
  await db.query(`DELETE FROM invoices`)
})

afterAll(async () => {
  await db.end()
})

describe("GET /invoices", () => {
  test("Get a list with one invoices", async () => {
    const res = await request(app).get('/invoices')
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ invoices: [testInvoice] })
  })
})

describe("GET /invoices/:id", () => {
  test("Gets a single invoice", async () => {
    const res = await request(app).get(`/invoices/${testInvoice.id}`)
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ invoice: testInvoice })
  })
  test("Responds with 404 for invalid id", async () => {
    const res = await request(app).get(`/invoices/0`)
    expect(res.statusCode).toBe(404);
  })
})

describe("POST /invoices", () => {
  test("Creates a single invoice", async () => {
    const res = await request(app).post('/invoices').send({ comp_code:'apple', amt:400 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      invoice: { id: expect.any(Number), comp_code:'apple', amt:400 }
    })
  })
})

describe("PATCH /invoices/:id", () => {
  test("Updates a single invoice", async () => {
    const res = await request(app).patch(`/invoices/${testInvoice.id}`).send({ comp_code:'apple', amt:400 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoice: { id: testInvoice.id, comp_code:'apple', amt:400 }
    })
  })
  test("Responds with 404 for invalid id", async () => {
    const res = await request(app).patch(`/invoices/0`).send({ comp_code:'apple', amt:400 });
    expect(res.statusCode).toBe(404);
  })
})
describe("DELETE /invoices/:id", () => {
  test("Deletes a single invoice", async () => {
    const res = await request(app).delete(`/invoices/${testInvoice.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: 'DELETED!' })
  })
})

