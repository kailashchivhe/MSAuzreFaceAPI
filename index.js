'use strict';

require('dotenv').config();

const axios = require('axios').default;

const express = require('express')
const app = express()
const port = 3000
app.set('view engine', 'ejs');

const bodyParser = require('body-parser');

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");

app.use(express.static('public'));
app.use(bodyParser.json());     
app.use(bodyParser.urlencoded({     
    extended: true
}));

const options = {
    swaggerDefinition: {
      info: {
        title: "Face API",
        version: "1.0",
        description: "Microsoft Azure face detection API",
      },
      host: "localhost:3000",
      basePath: "/",
    },
    apis: ["./index.js"],
  };

const specs = swaggerJsdoc(options);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors());

/**
 * @swagger
 * /detectFaces:
 *    get:
 *      description: Get the pixel values for detected faces in an image
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: url
 *            in: query
 *            type: string
 *            example: https://raw.githubusercontent.com/Azure-Samples/cognitive-services-sample-data-files/master/ComputerVision/Images/faces.jpg  
 *      responses:
 *          200:
 *              description: Successfully retrieved faces pixel
 *          400:
 *              description: Bad request 
 * 
 */

app.get("/detectFaces",async(req, res) =>{
    let subscriptionKeyForFaceAPI = process.env.FACE_API_KEY
    let endpointForFaceAPI = process.env.ENDPOINT
    let imageUrl=req.query.url;
    console.log(imageUrl);
    if(imageUrl.match(/\.(jpeg|jpg|png|bmp)$/) != null){
        axios({
            method: 'post',
            url: endpointForFaceAPI,
            params : {
                detectionModel: 'detection_03',
                returnFaceId: true
            },
            data: {
                url: imageUrl,
            },
            headers: { 'Ocp-Apim-Subscription-Key': subscriptionKeyForFaceAPI }
        }).then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type','Application/json');
            if(response.data.length>0){
                res.send(response.data);
            }
            else{
                res.send("No faces detected");
            }
            
        }).catch(function (error) {
            res.statusCode = 400;
            res.setHeader('Content-Type','Application/json');
            res.send(error);
        });
    }
    else{
        res.statusCode = 400;
        res.setHeader('Content-Type','Application/json');
        res.send("Invalid image format");
    }
});

app.listen(port, () => {
    console.log(`Server listening at port:${port}`);
});