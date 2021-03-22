const express = require('express');
const dotenv = require('dotenv')
dotenv.config();

const getNLUInstance = () => {

    let api_key = process.env.API_KEY
    let api_url = process.env.API_URL

    const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
    const { IamAuthenticator } = require('ibm-watson/auth');

    const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
        version: '2020-08-01',
        authenticator: new IamAuthenticator({
            apikey: api_key,
        }),
        serviceUrl: api_url,
    });

    return naturalLanguageUnderstanding

}




const getResponse = async (mode, endpoint, payload) => {


    console.log('Getting', mode, endpoint, payload)


    let analyzeParams = { features: null };
    analyzeParams[mode] = payload

    if (endpoint === 'emotion') {



        analyzeParams.features = {
            emotion:{
                document:true
            }
            // 'entities': {
            //     'emotion': true,
            //                  'limit': 2,
            // },
            // 'keywords': {
            //     'emotion': true,
           
            //     'limit': 2,
            // },
        }

    }

    if (endpoint === 'sentiment') {
        analyzeParams.features = {
            sentiment:{
                document:true
            }
            // 'entities': {
            //     'sentiment': true,
            //     'limit': 1
            // },
            // 'keywords': {
            //     'sentiment': true,

            //     'limit': 3
            // }
        }

    }


    console.log('Params', analyzeParams)


    let nlu = getNLUInstance()

    let response = await nlu.analyze(analyzeParams)

    console.log('Response', response.result)

    return response

}


const app = new express();

app.use(express.static('client'))

const cors_app = require('cors');
app.use(cors_app());

app.get("/", (req, res) => {
    res.render('index.html');
});

app.get("/url/emotion", async (req, res) => {

    let response = await getResponse('url', 'emotion', req.query.url);

    return res.send(response.result.emotion.document.emotion);
});

app.get("/url/sentiment", async (req, res) => {
    let response = await getResponse('url', 'sentiment', req.query.url);

    return res.send(response.result.sentiment.document.label);
});

app.get("/text/emotion", async (req, res) => {
    let response = await getResponse('text', 'emotion', req.query.text);

    return res.send(response.result.emotion.document.emotion);
});

app.get("/text/sentiment", async (req, res) => {
   let response = await getResponse('text', 'sentiment', req.query.text);

    return res.send(response.result.sentiment.document.label);
});

let server = app.listen(8080, () => {
    console.log('Listening', server.address().port)
})