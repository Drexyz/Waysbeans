//import models
const { user } = require("../../models");

// import package
const joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.addUsers = async (req, res) => {
  /////////////Input Validation//////////////
  //schema data register
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(4).required(),
    fullname: joi.string().min(3).required(),
  });
  //validate data register
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(401).send({
      error: error.details[0].message,
    });
  }

  try {
    //////check existing email//////
    const checker = await user.findOne({
      where: {
        email: req.body.email
      }
    });
    if (checker) {
      return res.status(409).send({
        status: "failed",
        message: "email already exist"
      })
    }

    ////////insert into db/////////
    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //input to table user
    const newUser = await user.create({
      ...req.body,
      password: hashedPassword,
      role: "user",
      photo: "user.jpg"
    });

    //create token
    const data = {
      id: newUser.id,
      role: newUser.role,
    };
    const token = jwt.sign(data, process.env.SECRET_KEY);

    //success response
    res.send({
      status: "success",
      data: {
        user: {
          email: newUser.email,
          token,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};
exports.getUser = async (req, res) => {
  /////////////Input Validation//////////////
  //schema data login
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(4).required(),
  });
  //validate data login
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(401).send({
      status: "failed",
      message: error.details[0].message,
    });
  }

  try {
    ///////////get data from db////////////
    const { email, password } = req.body;
    //get user with the same email & password
    const userlogin = await user.findOne({
      where: {
        email,
      },
    });

    //compare data password with hashed password
    const isValid = await bcrypt.compare(password, userlogin.password);

    //response user not found & wrong pass
    if (!userlogin || !isValid) {
      return res.status(400).send({
        status: "failed",
        message: "User not found or Password Not Match",
      });
    } else {
      //create token
      const data = {
        id: userlogin.id,
        role: userlogin.role,
        photo: userlogin.photo
      };
      const token = jwt.sign(data, process.env.SECRET_KEY);

      //response login
      res.send({
        status: "success",
        data: {
          user: {
            id: userlogin.id,
            fullname: userlogin.fullname,
            email: userlogin.email,
            role: userlogin.role,
            photo: process.env.PATH_FILE + userlogin.photo,
            token,
          },
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "server error",
    });
  }
};
exports.getProfile = async (req, res) => {
  try {
    ///////get data from db///////
    const { id } = req.params;
    let detailUser = await user.findOne({
      where: {
        id
      },
      attributes:  ["id", "fullName", "email", "photo"]
    });

    //////////response//////////
    //response user not found
    if (!detailUser) {
      return res.status(404).send({
        status: "failed",
      });
    }
    //response success
    detailUser.image =  process.env.PATH_FILE + detailUser.image;
    res.send({
      status: "success",
      data: {users: detailUser}
    })
  } catch (error) {
    console.log(error);
    res.status({
      status: "failed",
      message: "Server Error",
    });
  }
};
exports.checkUser = async (req, res) => {
  try {
    let detailUser = await user.findOne({
      where: {
        id: req.user.id
      },
      attributes:  ["id", "fullname", "email", "role", "photo"]
    });

    if (!detailUser) {
      return res.status(404).send({
        status: "failed",
      });
    }

    detailUser.photo =  process.env.PATH_FILE + detailUser.photo;

    res.send({
      status: "success",
      data: {user: detailUser}
    })
  } catch (error) {
    console.log(error);
    res.status({
      status: "failed",
      message: "Server Error",
    });
  }
}
exports.editUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.file){
      await user.update({...req.body}, {
        where: {
          id,
        },
      });
    } else {
      await user.update({...req.body, photo: req.file.filename,}, {
        where: {
          id,
        },
      });
    }

    //response
    res.send({
      status: "success",
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
}
