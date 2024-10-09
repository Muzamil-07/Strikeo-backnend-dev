const jwt = require('jsonwebtoken')
const {
  BadRequestResponse,
  UnauthorizedResponse
} = require('express-http-response')
const User = require('../models/User.js')
const Vendor = require('../models/Vendor.js')
const Admin = require('../models/StrikeO.js')

const verifyToken = function (req, res, next) {
  const { authorization } = req.headers
  if (
    (authorization && authorization.split(' ')[0] === 'Token') ||
    (authorization && authorization.split(' ')[0] === 'Bearer')
  ) {
    const token = authorization.split(' ')[1]
    jwt.verify(token, process.env.SECRET_KEY, async (error, data) => {
      if (error) {
        return next(new UnauthorizedResponse('Invalid Token'))
      } else {
        const user = await User.findById(data.id).populate('role activeBillingAddress')
        const vendor = await Vendor.findById(data.id).populate('role')
        const admin = await Admin.findById(data.id).populate('role')

        if (!user && !vendor && !admin) {
          return next(new UnauthorizedResponse('Invalid Token'))
        } else {
          req.user = user || vendor || admin
          next()
        }
      }
    })
  } else {
    next(new BadRequestResponse('Token not found!'))
  }
}

const isAdmin = function (req, res, next) {
  if (req.user.role?.type === 'StrikeO') {
    next()
  } else {
    return next(
      new UnauthorizedResponse('You are not authorized to perform this action!')
    )
  }
}

const isVendor = function (req, res, next) {
  if (req.user.role?.type === 'Vendor') {
    next()
  } else {
    return next(
      new UnauthorizedResponse('You are not authorized to perform this action!')
    )
  }
}

const isUser = function (req, res, next) {
  if (req.user.role?.type === 'User') {
    next()
  } else {
    return next(
      new UnauthorizedResponse('You are not authorized to perform this action!')
    )
  }
}

const isAdminOrVendor = function (req, res, next) {
  if (req.user.role?.type === 'StrikeO' || req.user.role?.type === 'Vendor') {
    next()
  } else {
    return next(
      new UnauthorizedResponse('You are not authorized to perform this action!')
    )
  }
}

const isAdminOrUser = function (req, res, next) {
  if (req.user.role?.type === 'StrikeO' || req.user.role?.type === 'User') {
    next()
  } else {
    return next(
      new UnauthorizedResponse('You are not authorized to perform this action!')
    )
  }
}

const isOptional = function (req, res, next) {
  if (
    req.user.role?.type === 'StrikeO' ||
    req.user.role?.type === 'Vendor' ||
    req.user.role?.type === 'User'
  ) {
    next()
  } else {
    return next(
      new UnauthorizedResponse('You are not authorized to perform this action!')
    )
  }
}

const auth = {
  verifyToken,
  isUser,
  isAdmin,
  isVendor,
  isOptional,
  isAdminOrUser,
  isAdminOrVendor
}

module.exports = auth
