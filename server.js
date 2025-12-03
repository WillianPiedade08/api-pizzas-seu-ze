const express = require('express')
const cors = require('cors')

const port = process.env.PORT || 5000
const app = express()
const routes = require('./src/routes')

app.use(cors())
app.use(express.json())
app.use(routes)

app.listen(port, () => {
    console.log(`Server respondendo em http://localhost:${port}`)
})