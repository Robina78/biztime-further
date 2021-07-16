//Tell node we're on test mode
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require('../app');
const db = require('../db');

let testCompany;
beforeEach( async () => {
    const result = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ('at&t', 'AT&T', 'telecommunication')
        RETURNING code, name, description`);
    testCompany = result.rows[0]
});

afterEach( async () => {
    await db.query(`DELETE FROM companies`);
});

afterAll( async () => {
    await db.end();
})

describe("GET /companies", () => {
    test("Get a list with one company", async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ companies: [testCompany]})
    });
});

describe("GET /companies/:code", () => {
    test("Get a single company", async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);       
        expect(res.body).toEqual({company:{ 
          code: testCompany.code,
          name: testCompany.name,
          description: testCompany.description,
          invoices: []}})
    });
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).get(`/companies/0`)
        expect(res.statusCode).toBe(404);
    })
})

describe("POST /companies", () => {
    test("Creates a single company", async () => {
      const res = await request(app).post('/companies').send({ name: 'CVS', description: 'healthcare' });
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        company: { code: 'cvs', name: 'CVS', description: 'healthcare' }
      });
    });
  });

describe("PUT /companies/:code", () => {
  test("Updates a single company", async () => {
    const res = await request(app).put(`/companies/${testCompany.code}`).send({ name: 'AT&T', description:'telec ommunication comp' });
    expect(res.statusCode).toBe(200);
    console.log(res.body)
    expect(res.body).toEqual({
      company: { code: testCompany.code, name: 'AT&T', description: 'telec ommunication comp' }
    })
  }) 
  test("Responds with 404 for invalid code", async () => {
    const res = await request(app).put(`/companies/0`).send({ name: 'CVS', description: 'healthcare' });
    expect(res.statusCode).toBe(404);
  }) 
});

describe("DELETE /companies/:code", () => {
    test("Deletes a single company", async () => {
      const res = await request(app).delete(`/companies/${testCompany.code}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ 'status': 'deleted' })
    })
  });

