const { product } = require("../../models");

exports.addProduct = async (req, res) => {
  try {
    if (req.user.role != "admin") {
      res.status(401).send({
        status: "failed",
        message: "only admin can add product",
      });
    } else {
      //insert data into product
      const addedProduct = await product.create({
        ...req.body,
        photo: req.file.filename,
      });

      //response
      res.send({
        status: "success",
        data: {
          product: {
            id: addedProduct.id,
            name: addedProduct.name,
            price: addedProduct.price,
            description: addedProduct.description,
            stock: addedProduct.stock,
            photo: addedProduct.photo,
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
};
exports.getProducts = async (req, res) => {
  try {
    ///////////get data from db//////////
    let products = await product.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      }
    })

    ////modify data for response////
    products = products.map( elem => {
      elem.photo = process.env.PATH_FILE + elem.photo
      return elem
    })

    ////response////
    res.send({
      status: "success",
      data: {products}
    })

  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
}
exports.getProduct = async (req, res) => {
  try {
    //////get data from db//////
    const { id } = req.params;
    let product_ = await product.findOne({
      where: {id},
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      }
    })

    ////modify data for response////
    product_.photo = process.env.PATH_FILE + product_.photo

    //response
    res.send({
      status: "success",
      data: {product: product_}
    })

  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
}
