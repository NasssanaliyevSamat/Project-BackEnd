const express = require('express');
const router = express.Router();
const {database} = require('../config/helpers');

// GET все заказы
router.get('/', (req, res) => {
    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id', 'p.title', 'p.description', 'p.price', 'u.username'])
        .sort({id: 1})
        .getAll()
        .then(orders => {
            if (orders.length > 0) {
                res.json(orders);
            } else {
                res.json({message: "Orders not found"});
            }

        }).catch(error => res.json(error));
});

// Get один заказ
router.get('/:id',  (req, res) => {
    const orderId = req.params.id;
    // console.log(orderId);

    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id', 'p.title', 'p.description', 'p.price', 'p.image', 'od.quantity as quantityOrdered'])
        .filter({'o.id': orderId})
        .getAll()
        .then(orders => {
            // console.log(orders);
            if (orders.length > 0) {
                res.json(orders);
            } else {
                res.json({message: `Singe orders not found with: ${orderId}`});
            }

        }).catch(error => res.json(error));
});

module.exports = router;
