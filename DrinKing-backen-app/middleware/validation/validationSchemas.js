const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi)

const registerSchema = Joi.object({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    username: Joi.string().min(3).max(128).alphanum().required(),
    password: Joi.string()
      .regex(
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,126}$/
      )
      .required(),
  }),
});

const loginSchema = Joi.object({
  body: Joi.object().keys({
    username: Joi.string().min(3).max(128).alphanum().required(),
    password: Joi.string()
      .regex(
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,126}$/
      )
      .required(),
  }),
});

const changeDataSchema = Joi.object({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
});

const changePasswordSchema = Joi.object({
  body: Joi.object().keys({
    password: Joi.string()
      .regex(
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,126}$/
      )
      .required(),
    newPassword: Joi.string()
      .regex(
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,126}$/
      )
      .required(),
  }),
});

const deleteAccountSchema = Joi.object({
  body: Joi.object().keys({
    username: Joi.string().min(3).max(128).alphanum().required(),
    password: Joi.string()
      .regex(
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,126}$/
      )
      .required(),
  }),
});

const changePhotoSchema = Joi.object({
  body: Joi.object({
    type: Joi.string().alphanum().required(),
    image: Joi.string().required(),
  }),
});

const refreshTokenSchema = Joi.object({
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
});

const confirmationEmailSchema = Joi.object({
  params: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
});

const resetPasswordEmailSchema = Joi.object({
  params: Joi.object({
    email: Joi.string().email().required(),
  }),
});

const resetPasswordSchema = Joi.object({
  params: Joi.object({
    token: Joi.string().required(),
  }),
});

const confirmEmailSchema = Joi.object({
  params: Joi.object({
    token: Joi.string().required(),
  }),
  body: Joi.object({
    password: Joi.string()
      .regex(
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,126}$/
      )
      .required(),
  }),
});

const banUserSchema = Joi.object({
  params: Joi.object().keys({
    userId: Joi.objectId().required(),
  }),
  body: Joi.object().keys({
    banStatus: Joi.boolean().required()
  }),
});

const barLoginSchema = Joi.object().keys({
  body: Joi.object().keys({
    username: Joi.string().min(3).max(128).alphanum().required(),
    password: Joi.string()
      .regex(
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,126}$/
      )
      .required(),
  }),
});

const createBarSchema = Joi.object({
  body: Joi.object({
    manager: Joi.object().keys({
      username: Joi.string().min(3).max(128).alphanum().required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .regex(
          /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,126}$/
        )
        .required(),
    }),
    bar: Joi.object().keys({
      name: Joi.string().required(),
      address: Joi.object().keys({
        street: Joi.string().required(),
        building_number: Joi.string().required(),
        city: Joi.string().required(),
        postal_code: Joi.string().alphanum().required(),
      }),
      // phone_number: Joi.string()
      //   .regex(/(^|\+|(?<=\s))(100|\d\d?)(?=(\s|$))/)
      //   .alphanum().required(),
    }),
  }),
});

const getSpecificBarSchema = Joi.object().keys({
  params: Joi.object().keys({
    barId: Joi.objectId().required(),
  }),
});

const assignManagerSchema = Joi.object().keys({
  body: Joi.object().keys({
    barId: Joi.objectId().required(),
    manager: Joi.string().required(),
  }),
});

const addImageBarSchema = Joi.object({
  body: Joi.object().keys({
    image: Joi.string().required(),
    type: Joi.string().alphanum().required(),
  }),
  params: Joi.object().keys({
    barId: Joi.objectId().required(),
  }),
});

const deleteImageBarSchema = Joi.object({
  body: Joi.object().keys({
    imageId: Joi.objectId().required(),
  }),
  params: Joi.object().keys({
    barId: Joi.objectId().required(),
  }),
});

const getSpecificEventSchema = Joi.object({
  params: Joi.object().keys({
    eventId: Joi.objectId().required(),
  }),
});

const finishEventSchema = Joi.object({
  params: Joi.object().keys({
    eventId: Joi.objectId().required(),
  }),
});

const reviewEventSchema = Joi.object({
  params: Joi.object().keys({
    eventId: Joi.objectId().required(),
  }),
});

const createEventSchema = Joi.object({
  body: Joi.object({
    event: Joi.object().keys({
      name: Joi.string().min(8).max(255).required(),
      bar_id: Joi.objectId().required(),
      start_date: Joi.number().required(),
      end_date: Joi.number().required(),
    }),
    rewards: Joi.array().items(
      Joi.object({
        value: Joi.string().alphanum().required(),
        discount_type: Joi.string().required(),
        reward_type: Joi.string().required(),
        currency: Joi.string().alphanum().required()
      })
    ),
  }),
});

const getReceiptsForUserSchema = Joi.object({
  params: Joi.object().keys({
    eventId: Joi.objectId().required(),
  }),
});

const getAllReceiptsSchema = Joi.object({
  params: Joi.object().keys({
    eventId: Joi.objectId().required(),
  }),
});

const createReceiptSchema = Joi.object({
  body: Joi.object().keys({
    image: Joi.string().required(),
    type: Joi.string().alphanum().required(),
    event_id: Joi.objectId().required(),
  }),
});

const approveReceiptSchema = Joi.object({
  params: Joi.object().keys({
    receiptId: Joi.objectId().required(),
  }),
  body: Joi.object().keys({
    value: Joi.string().alphanum().required(),
    realReceiptId: Joi.string().alphanum().required(),
  }),
});

const rejectReceiptSchema = Joi.object({
  params: Joi.object().keys({
    receiptId: Joi.objectId().required(),
  }),
});

const createTransactionSchema = Joi.object({
  body: Joi.object().keys({
    value: Joi.string().alphanum().required(),
    bar_id: Joi.objectId().required(),
  }),
});

const validateTransactionSchema = Joi.object({
  params: Joi.object().keys({
    transactionId: Joi.objectId().required(),
  }),
});

const rejectTransactionSchema = Joi.object({
  params: Joi.object().keys({
    transactionId: Joi.objectId().required(),
  }),
});

module.exports = {
  "/api/users/register": registerSchema,
  "/api/users/login": loginSchema,
  "/api/profile/changeData": changeDataSchema,
  "/api/profile/deleteAccount": deleteAccountSchema,
  "/api/profile/changePassword": changePasswordSchema,
  "/api/profile/changePhoto": changePhotoSchema,
  "/api/users/refresh": refreshTokenSchema,
  "/api/users/confirmation/resend": confirmationEmailSchema,
  "/api/users/resetPassword/send/:email": resetPasswordEmailSchema,
  "/api/users/resetPassword/:token": resetPasswordSchema,
  "/api/users/confirmation/:token": confirmEmailSchema,
  "/ban/:userId": banUserSchema,
  "/api/bars/login": barLoginSchema,
  "/api/bars/": createBarSchema,
  "/api/bars/specific/:barId": getSpecificBarSchema,
  "/api/bars/assignManager": assignManagerSchema,
  "/api/bars/addImage/:barId": addImageBarSchema,
  "/api/bars/deleteImage/:barId": deleteImageBarSchema,
  "/api/events/specific/:eventId": getSpecificEventSchema,
  "/api/events/finish/:eventId": finishEventSchema,
  "/api/events/reviewing/:eventId": reviewEventSchema,
  "/api/events/": createEventSchema,
  "/api/receipts/user/event/:eventId": getReceiptsForUserSchema,
  "/api/receipts/admin/event/:eventId": getAllReceiptsSchema,
  "/api/receipts/": createReceiptSchema,
  "/api/receipts/approve/:receiptId": approveReceiptSchema,
  "/api/receipts/reject/:receiptId": rejectReceiptSchema,
  "/api/transactions/": createTransactionSchema,
  "/api/transactions/validate/:transactionId": validateTransactionSchema,
  "/api/transactions/delete/:transactionId": rejectTransactionSchema,
};
