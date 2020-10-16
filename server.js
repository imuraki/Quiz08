const express = require('express');
const app = express();
const swaggerjsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const axios = require('axios');

const port = 3000;
let conn;

const mariadb = require('mariadb');
const pool = mariadb.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'sample',
        port: 3306,
        connectionLimit: 5
});

const options = {
  swaggerDefinition: {
    info: {
      title: 'APIs for Assignment08',
      version: '1.0.0',
      description: 'REST API\'s Developed for Assignment08 along with swagger ',
    },
    host: '162.243.170.203:3000',
    basepath: '/',
  },
  apis: ['./server.js'],
};
const specs = swaggerjsdoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
 * @swagger
 * /customers:
 *     get:
 *       summary: Return all customers
 *       tags: [Customers]
 *       produces:
 *             - application/json
 *       responses:
 *           200:
 *               description: Data array containing list of customers.
 *           500:
 *               description: Internal Server Error
 */
app.get('/customers', async (req, res) => {
    let rows;

    try {
        //conn = await pool.getConnection();
        rows = await pool.query("SELECT * FROM customer");
	res.json({data:rows});
    } catch (err){
        console.log(err);
    }
});

/**
 * @swagger
 * /customers/{code}:
 *   get:
 *     summary: returns the customer with the code provided
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: code
 *         type: string
 *         required: true
 *         description: code of the customer
 *     responses:
 *       '200':
 *         description: OK
 */

app.get('/customers/:code', async (req, res) => {
    let rows;

    try {
        rows = await pool.query("SELECT * FROM customer WHERE CUST_CODE=?", [req.params.code]);
        if(rows.length == 0)
            return res.status(404).json({error: 'Customer not found'});

        res.json({data:rows[0]});

    } catch (err){
        console.log(err);
    }
});

/**
 * @swagger
 * /foods:
 *     get:
 *       summary: Return all food items
 *       tags: [Foods]
 *       produces:
 *             - application/json
 *       responses:
 *           200:
 *               description: Data array containing list of food items.
 *           500:
 *               description: Internal Server Error
 */
app.get('/foods', async (req, res) => {
    let rows;

    try {
        rows = await pool.query("SELECT * FROM foods");
        res.json({data:rows});
    } catch (err){
        console.log(err);
    }
});

/**
 * @swagger
 * /foods/{id}:
 *   get:
 *     summary: returns the food with the id provided
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: OK
 */

app.get('/foods/:id', async (req, res) => {
    let rows;

    try {

        rows = await pool.query("SELECT * FROM foods WHERE ITEM_ID=?", [req.params.id]);
        if(rows.length == 0)
            return res.status(404).json({error: 'food not found'});
        res.json({data:rows[0]});

    } catch (err){
        console.log(err);
    }
});

/**
 * @swagger
 * /orders:
 *     get:
 *       summary: Return all orders
 *       tags: [Orders]
 *       produces:
 *             - application/json
 *       responses:
 *           200:
 *               description: Data array containing list of orders.
 *           500:
 *               description: Internal Server Error
 */
app.get('/orders', async (req, res) => {
    let rows;

    try {
        rows = await pool.query("SELECT * FROM orders");
        res.json({data:rows});
    } catch (err){
        console.log(err);
    }
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: returns the order with the id provided
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: OK
 */

app.get('/orders/:id', async (req, res) => {
    let rows;

    try {
    
        rows = await pool.query("SELECT * FROM orders WHERE ORD_NUM=?", [req.params.id]);
        if(rows.length == 0)
            return res.status(404).json({error: 'order not found'});
        res.json({data:rows[0]});

    } catch (err){
        console.log(err);
    }
});

/**
 * @swagger
 * /companies:
 *     get:
 *       summary: Return all companies
 *       tags: [Companies]
 *       produces:
 *             - application/json
 *       responses:
 *           200:
 *               description: Data array containing list of companies.
 *           500:
 *               description: Internal Server Error
 */


app.get('/companies', async (req, res) => {
    let rows;

    try {
        rows = await pool.query("SELECT * FROM company");
        res.json({data:rows});
    } catch (err){
        console.log(err);
    }
});

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: returns the company with the given id
 *     tags: [Companies]
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: Data array containing list of companies
 *       '500':
 *         description: Internal Server Error
 */

app.get('/companies/:id', async (req, res) => {

  try {

    const {id} = req.params;

    if (!id || id.length == 0 || id.length > 6 || !/^\d+$/.test(id))
        return res.status(400).json({error: 'Invalid Company ID'});

     const company  = await pool.query(
        "SELECT * FROM company WHERE COMPANY_ID=?", [id],
      );

    if(company.length == 0)
        return res.status(404).json({error: 'Company not found'});

    res.status(200).json({
      data: company[0]
    });

  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});


/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Creates a new company
 *     tags: [Companies]
 *     parameters:
 *       - name: id
 *         in: formData
 *         type: string
 *         required: true
 *       - name: name
 *         in: formData
 *         type: string
 *         required: true
 *       - name: city
 *         in: formData
 *         type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Internal Server Error
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Not Found Error
 */
app.post(
  '/companies',

  [check('id').not().isEmpty().isNumeric().isLength({max: 6}).withMessage('id cannot be more than 6 digits long.'),
  check('name').not().isEmpty().isLength({min:3, max: 25}).withMessage('Name must be of 3 characters long.')
   .matches(/^[A-Za-z\s]+$/).withMessage('Name must be alphabetic.').trim().escape(),
  check('city').not().isEmpty().isLength({min:3, max: 25}).withMessage('City must be of 3 characters long.')
   .matches(/^[A-Za-z\s]+$/).withMessage('City must be alphabetic.').trim().escape()],
   
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {id, name, city} = req.body;

      const existingCompany = await pool.query(
        "SELECT * FROM company WHERE COMPANY_ID=?", [id],
      );
      
      if(existingCompany.length > 0)
        return res.status(400).json({error: 'Company ID already taken'});

      let result = await pool.query(
        'INSERT INTO `company` (`COMPANY_ID`, `COMPANY_NAME`, `COMPANY_CITY`) VALUES (?, ?, ?)',
        [id, name, city]
      );

      res.status(201).json({
        message: 'Success',
        data: {
            id,
            name,
            city,
          request: {
            type: 'GET',
            url: 'http://162.243.170.203:3000/companies/' + id,
          },
        },
      });

    } catch (err) {
      console.log(err)
      res.status(500).json({
        error: err,
      });
   }
  }
)

/**
 * @swagger
 * /companies/{id}:
 *   put:
 *     summary: updates a company
 *     tags: [Companies]
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *         required: true
 *       - name: name
 *         in: formData
 *         type: string
 *         required: true
 *       - name: city
 *         in: formData
 *         type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Internal Server Error
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Not Found Error
 */
app.put(
  '/companies/:id',
  [
    check('name').not().isEmpty().isLength({min:3, max: 25}).withMessage('Name must be of 3 characters long.')
   .matches(/^[A-Za-z\s]+$/).withMessage('Name must be alphabetic.').trim().escape(),
  check('city').not().isEmpty().isLength({min:3, max: 25}).withMessage('City must be of 3 characters long.')
   .matches(/^[A-Za-z\s]+$/).withMessage('City must be alphabetic.').trim().escape()
  ],
  async (req, res) => {
      try {
      
      const {id} = req.params;
      if (!id || id.length == 0 || id.length > 6 || !/^\d+$/.test(id)) {
        return res.status(400).json({error: 'Invalid Company ID'});
      }

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {name, city} = req.body;

      const existingCompany = await pool.query(
        "SELECT * FROM company WHERE COMPANY_ID=?", [id],
      );

      if(existingCompany.length == 0)
        return res.status(404).json({error: 'Company not found'});

      let result = await pool.query(
        'UPDATE  `company` SET  `COMPANY_NAME`=?, `COMPANY_CITY`=? WHERE `COMPANY_ID`= ?',
        [name, city, id]
      );

      res.status(200).json({
        message: 'company updated successfully',
        data: {
          id,
          name,
          city,
        },
      });
    } catch (err) {
      console.log(err)
      res.status(500).json({
        error: err,
      });
    }
});

/**
 * @swagger
 * /companies/{id}:
 *   patch:
 *     summary: Updates the company with the given patch
 *     tags: [Companies]
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *         required: true
 *       - name: name
 *         in: formData
 *         type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Internal Server Error
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Not Found Error
 */

app.patch('/companies/:id', [check('name').not().isEmpty().isLength({min:3, max: 25}).withMessage('Name must be of 3 characters long.')
   .matches(/^[A-Za-z\s]+$/).withMessage('Name must be alphabetic.').trim().escape()], async (req, res) => {

  try {

    const {id} = req.params;
    const {name} = req.body;

    if (!id || id.length == 0 || id.length > 6 || !/^\d+$/.test(id))
        return res.status(400).json({error: 'Invalid Company ID'});

     const existingCompany = await pool.query(
        "SELECT * FROM company WHERE COMPANY_ID=?", [id],
      );

    if(existingCompany.length == 0)
        return res.status(404).json({error: 'Company not found'});

    let result = await pool.query(
        'UPDATE  `company` SET  `COMPANY_NAME`=? WHERE `COMPANY_ID`= ?',
        [name, id]
      );

    res.status(200).json({
      message: 'success',
       data: {
          id,
          name,
        },
    });

  } catch (err) {
    console.log(err)
    res.status(500).json({
      error: err,
    });
  }
});


/**
 * @swagger
 * /companies/{id}:
 *   delete:
 *     summary: Deletes a company with the given id
 *     tags: [Companies]
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Internal Server Error
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Not Found Error
 */

app.delete('/companies/:id', async (req, res) => {

  try {

    const {id} = req.params;

    if (!id || id.length == 0 || id.length > 6 || !/^\d+$/.test(id))
        return res.status(400).json({error: 'Invalid Company ID'});

     const existingCompany = await pool.query(
        "SELECT * FROM company WHERE COMPANY_ID=?", [id],
      );

    if(existingCompany.length == 0)
        return res.status(404).json({error: 'Company not found'});

    let result = await pool.query('DELETE FROM company WHERE `COMPANY_ID`=?', [
      id,
    ]);

    res.status(201).json({
      message: 'successfully deleted',
    });

  } catch (err) {
    res.status(500).json({
      error: err,
    });
  } 
});


/**
 * @swagger
 * /say:
 *   get:
 *     summary: returns the greeting with keyword value.
 *     tags: [Say - API Gateway]
 *     parameters:
 *       - name: keyword
 *         in: query
 *         type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: OK
 */

app.get("/say", async (req, res) => {

  try {
    if(!req.query.keyword)
        return res.status(404).json({error: 'Missing Query parameter keyword'});

    const msg = await axios.get(
      `https://jhqvekdcy3.execute-api.us-east-1.amazonaws.com/v1/say?keyword=${req.query.keyword}`
    );

    res.send(msg.data);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
  
});


app.get('*', (req, res) => {
    res.send('Welcome client!');
})

app.listen(port, () => {
        console.log(`Example app listening at ${port}`);
})

