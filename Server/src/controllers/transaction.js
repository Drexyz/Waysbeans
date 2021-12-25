const { transaction, order, user, product } = require('../../models');

exports.addTransaction = async (req, res) => {
  try {
    if (req.user.role != "user") {
      res.status(401).send({
        status: "failed",
        message: "only user can add transaction",
      });
    } else {
      //insert data into transaction
      const addedTransaction = await transaction.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        attachment: req.file.filename,
        user_id: req.user.id,
        status: "waiting approve"
      });

      //insert data into table order
      const orderProducts = JSON.parse(req.body.product).map(orderProduct => {
        return {
          product_id: orderProduct.id,
          transaction_id: addedTransaction.id,
          orderQuantity: orderProduct.orderQuantity,
        }
      })
      await order.bulkCreate(orderProducts);
    
      //prepare data for response
      const newlyTransaction = await transaction.findOne({
        where: {
          id: addedTransaction.id
        },
        include: [
          {
            model: user,
            as: "user",
            attributes: ["id", "fullname", "email"],
          },
        ],
      })
      let newlyOrders = await order.findAll({
        where: {
          transaction_id: addedTransaction.id
        },
        attributes: ["orderQuantity"],
        include: {
          model: product,
          as: "product",
          attributes: ["id", "name", "price", "description", "photo"],
        }
      })
      newlyOrders = newlyOrders.map (newlyOrder => {
        return{
          id: newlyOrder.product.id,
          name: newlyOrder.product.name,
          price: newlyOrder.product.price,
          description: newlyOrder.product.description,
          photo: newlyOrder.product.photo,
          orderQuantity: newlyOrder.orderQuantity,
        }
      })

      //response
      res.send({
        status: "success",
        data: {
          transaction: {
            id: newlyTransaction.id,
            user: newlyTransaction.user,
            name: newlyTransaction.name,
            email: newlyTransaction.email,
            phone: newlyTransaction.phone,
            address: newlyTransaction.address,
            attachment: newlyTransaction.attachment,
            status: newlyTransaction.status,
            products: newlyOrders 
          }
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
}
exports.getTransactions = async (req, res) => {
  try {
    //get data from db
    let transactionsData = await transaction.findAll({
      attributes: {
        exclude: ["user_id", "createdAt", "updatedAt"],
      },
      include: [
        {
          model: user,
          as: 'user',
          attributes: ["id", "fullname", "email"],
        },
        {
          model: order,
          as: "productOrdered",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: {
            model: product,
            as: "product",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          }
        }
      ]
    })
    //modify data for response
    transactionsData = transactionsData.map(transactionData => {
      const products = transactionData.productOrdered.map(elem => {
        return {
          id: elem.product.id,
          name: elem.product.name,
          price: elem.product.price,
          description: elem.product.description,
          photo: elem.product.photo,
          orderQuantity: elem.orderQuantity,
        }
      })
      return {
        id: transactionData.id,
        user: transactionData.user,
        name: transactionData.name,
        email: transactionData.email,
        phone: transactionData.phone,
        address: transactionData.address,
        attachment: transactionData.attachment,
        status: transactionData.status,
        products
      }
    }) 

    //response
    res.send({
      status: "success",
      data: {
        transactions: transactionsData
      }
    });

  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
}
exports.editTransaction = async (req, res) => {
  try{
    const { id } = req.params;

    //update table transaction
    await transaction.update(req.body, { 
      where: {
        id,
      } 
    });

    //prepare data for response
    const editedTransaction = await transaction.findOne({
      where: {
        id
      },
      include: [
        {
          model: user,
          as: "user",
          attributes: ["id", "fullname", "email"],
        },
      ],
    })
    let editedOrders = await order.findAll({
      where: {
        transaction_id: id
      },
      attributes: ["orderQuantity"],
      include: {
        model: product,
        as: "product",
        attributes: ["id", "name", "price", "description", "photo"],
      }
    })
    editedOrders = editedOrders.map (editedOrder => {
      return{
        id: editedOrder.product.id,
        name: editedOrder.product.name,
        price: editedOrder.product.price,
        description: editedOrder.product.description,
        photo: editedOrder.product.photo,
        orderQuantity: editedOrder.orderQuantity,
      }
    })

    //response
    res.send({
      status: "success",
      data: {
        transaction: {
          id: editedTransaction.id,
          userOrder: editedTransaction.user,
          name: editedTransaction.name,
          email: editedTransaction.email,
          phone: editedTransaction.phone,
          address: editedTransaction.address,
          attachment: editedTransaction.attachment,
          status: editedTransaction.status,
          products: editedOrders 
        }
      },
    });

  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
}
exports.myTransaction = async (req, res) => {
  try {
    if (req.user.role != "user") {
      res.status(401).send({
        status: "failed",
        message: "only user that can access",
      });
    } else {
      let transactionsData = await transaction.findAll({
        where: {
          user_id: req.user.id
        },
        attributes: {
          exclude: ["user_id", "updatedAt"],
        },
        include: [
          {
            model: order,
            as: "productOrdered",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            include: {
              model: product,
              as: "product",
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            }
          }
        ]
      })
      //modify data for response
      transactionsData = transactionsData.map(transactionData => {
        const products = transactionData.productOrdered.map(elem => {
          return {
            id: elem.product.id,
            name: elem.product.name,
            price: elem.product.price,
            description: elem.product.description,
            photo: elem.product.photo,
            orderQuantity: elem.orderQuantity,
          }
        })
        return {
          id: transactionData.id,
          name: transactionData.name,
          email: transactionData.email,
          phone: transactionData.phone,
          address: transactionData.address,
          attachment: transactionData.attachment,
          status: transactionData.status,
          date: transactionData.createdAt,
          products
        }
      }) 
  
      //response
      res.send({
        status: "success",
        data: {
          transactions: transactionsData
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
}