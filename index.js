const Elasticsearch = require("elasticsearch")
const express = require('express')
const path = require('path')
const cors = require('cors')

require('dotenv').config()

const app = express()
const elasticClient = new Elasticsearch.Client({ host: process.env.ELASTIC_PORT })
const queryIndex = 'cities'
const PORT = process.env.SERVER_PORT


elasticClient.ping({ requestTimeout: 30000 }, (err) => {
    if (err) {
        console.log('Elastic search is down!')
        return
    }
    console.log('Elastc search is ready to run!')
})
app.use(express.json())
app.use(cors())
app.get("/", function (req, res) {
    res.sendFile("template.html", {
        root: path.join(__dirname, "view"),
    });
});

app.get('/search', async (req, res) => {
    const query = req.query.q
    const body = {
        query: {
            wildcard: {
                name: `${query}*`
            }
        }
    }
    try {
        const result = await elasticClient.search({ index: queryIndex, body: body, type: "_doc" })
        res.status(200).send(result.hits.hits)
        console.log(result.hits.hits)
    } catch (error) {
        res.status(400).send(error)
    }
})

app.listen(PORT, () => {
    console.log('Server is running on port: ' + PORT);
})




