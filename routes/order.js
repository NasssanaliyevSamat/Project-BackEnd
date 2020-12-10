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

// Post новый заказ
router.post('/new', async (req, res) =>{
    let {userId, products} = req.body;
    console.log(userId);
    console.log(products);

    if (userId !== null && userId > 0 && !isNaN(userId)) // isNaN = is not a number
    {
        database.table('orders')
            .insert({
                user_id: userId
            })
            .then(newOrderId => {
                if(newOrderId > 0)
                {
                    products.forEach(async (p) =>{
                       let data = await database.table('products')
                           .filter({id: p.id})
                           .withFields(['quantity'])
                           .get();
                       let inCount = parseInt(p.inCount);

                       // Вычитаем количество заказанных из количества имеющихся продуктов в базе данных

                       if (data.quantity > 0)
                       {
                            data.quantity = data.quantity - inCount;

                            if ( data.quantity < 0 )
                            {
                                data.quantity = 0;
                            }
                       }
                       else
                       {
                           data.quantity = 0;
                       }
                        // Создание нового деталя заказа
                       database.table('orders_details')
                           .insert({
                               order_id: newOrderId,
                               product_id: p.id,
                               quantity: inCount
                           })
                           .then(newId => { // Вычитание количества товара
                               database.table('products')
                                   .filter({id: p.id})
                                   .update({
                                       quantity: data.quantity
                                   })
                                   .then(success => {}).catch(error => console.log(error));
                           })
                           .catch(error => console.log(error));
                    });
                }
                else
                {
                    res.json({message: 'Failed new order when adding order detail', success: false});
                }
                // При успешном выполнении
                res.json({
                    message: `Order successfully created with id ${newOrderId}`,
                    success:true,
                    order_id:newOrderId,
                    products: products
                }).catch(error => console.log(error));

            })
            .catch(error => console.log(error));
    }
    else
    {
        res.json({message: 'Fail create new order', success: false});
    }
});

module.exports = router;
