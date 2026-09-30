const Joi = require("joi");

module.exports.listingSchema = Joi.object({

    listing: Joi.object({

        title: Joi.string().required(),

        description: Joi.string().required(),

        location: Joi.string().required(),

        country: Joi.string().required(),

        price: Joi.number()
            .required()
            .min(0),

        // Multiple images are uploaded through Multer,
        // so they are not validated here.
        images: Joi.any(),

        // Coordinates selected from the Leaflet map
        latitude: Joi.number().required(),

        longitude: Joi.number().required()

    }).required()

});


module.exports.reviewSchema = Joi.object({

    review: Joi.object({

        rating: Joi.number()
            .required()
            .min(1)
            .max(5),

        comment: Joi.string()
            .required()

    }).required()

});