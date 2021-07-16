// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');


let testInvoice;
beforeEach(async () => {
  const result = await db.query(
      `INSERT INTO invoices (comp_code, amt) 
       VALUES ('at&t', 300) 
       RETURNING id, comp_code`);
  testInvoice = result.rows[0]
});

afterEach(async () => {
  await db.query(`DELETE FROM invoices`)
})

afterAll(async () => {
  await db.end()
})

describe("GET /invoices", () => {
  test("Get a list of invoices", async () => {
    const res = await request(app).get('/invoices')
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ invoices: [testInvoice] });
  });
});

describe("GET /invoices/:id", () => {
  test("Gets a single invoice", async () => {
    const res = await request(app).get(`/invoices/${testInvoice.id}`)
    expect(res.statusCode).toBe(200);     
    expect(res.body).toEqual({  invoice: {
      id: testInvoice.id,
      company: { code: 'at&t', name: 'AT&T', description: 'telecommunication' },
      amt: 300,
      paid: false,
      add_date: '2021-07-15T07:00:00.000Z',
      paid_date: null
    }});
      
  });

  test("Responds with 404 for invalid id", async () => {
    const res = await request(app).get(`/invoices/0`)
    expect(res.statusCode).toBe(404);
  })
})

describe("POST /invoices", () => {
  test("Creates a single invoice", async () => {
    const res = await request(app).post('/invoices').send({ comp_code:'ibm', amt:500 });
    expect(res.statusCode).toBe(200);    
    expect(res.body).toEqual({
      invoice: { id: expect.any(Number),
        comp_code: 'ibm',
        amt: 500,
        paid: false,
        add_date: '2021-07-15T07:00:00.000Z',
        paid_date: null }
    })
  })
})

describe("PUT /invoices/:id", () => {
  test("Updates a single invoice", async () => {
    const res = await request(app).put(`/invoices/${testInvoice.id}`).send({ amt:'400', paid:false, paid_date:null });
    expect(res.statusCode).toBe(200);
    console.log(res.body)
    expect(res.body).toEqual({
      invoice: { id: testInvoice.id,
        comp_code: 'at&t',
        amt: 400,
        paid: false,
        add_date: '2021-07-15T07:00:00.000Z',
        paid_date: null}
    })
  })
  test("Responds with 404 for invalid id", async () => {
    const res = await request(app).put(`/invoices/0`).send({ comp_code:'apple', amt:400 });
    expect(res.statusCode).toBe(404);
  })
})
describe("DELETE /invoices/:id", () => {
  test("Deletes a single invoice", async () => {
    const res = await request(app).delete(`/invoices/${testInvoice.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({"status": "deleted" })
  })
})

