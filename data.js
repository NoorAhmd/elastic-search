const Elasticsearch = require('elasticsearch')
const path = require('path')
const jsonFile = './data/cities.json'
const indexName = 'test'
const typeName = '_doc'

const cities = require(jsonFile)
const elasticClient = new Elasticsearch.Client({ host: process.env.ELASTIC_PORT })

elasticClient.ping({ requestTimeout: 30000 }, (err) => {
    if (err) {
        console.log('Elastic search is down!')
        return
    }
    console.log('Elastc search is ready to run!')
})

const createIndex = async () => {
    try {
        const result = await elasticClient.indices.create({
            index: indexName,
            body: {
                "settings": {
                    "analysis": {
                        "filter": {
                            "my_ascii_folding": {
                                "type": "asciifolding",
                                "preserve_original": true
                            }
                        },
                        "analyzer": {
                            "turkish_analyzer": {
                                "tokenizer": "standard",
                                "filter": [
                                    "lowercase",
                                    "my_ascii_folding"
                                ]
                            }
                        }
                    }
                },
                "mappings": {
                    "properties": {
                        "name": {
                            "type": "text",
                            "analyzer": "turkish_analyzer"
                        }
                    }
                }
            }
        })
        console.log('Created the new Index: ', result)
    } catch (error) {
        console.log(error)
    }
}

//createIndex()

const addDataToIndex = async () => {
    try {
        const result = await elasticClient.index({
            index: indexName, type: typeName, body: {
                Key1: "Content for key one",
                Key2: "Content for key two",
                key3: "Content for key three"
            }
        })
        console.log(result)
    } catch (error) {
        console.log(error)
    }
}

//addDataToIndex()

let bulk = []
// const pushToBulk = city => {
//     cities.forEach(city => {
//         bulk.push({
//             index: {
//                 _index: indexName,
//                 _type: typeName
//             }
//         })
//         bulk.push(city);
//     })
// }

// pushToBulk()

const bulkIndex = async () => {
    cities.forEach(city => {
        bulk.push({
            index: {
                _index: indexName,
                _type: typeName
            }
        })
        bulk.push(city);
    })
    try {
        await elasticClient.bulk({ body: bulk })
        console.log('Successfully bulk operation: ', cities.length)
    } catch (error) {
        console.log(error);
        console.log('Failed to bulk')
    }
}

//bulkIndex()


