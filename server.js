const express = require('express')
const cors = require('cors')

const port = process.env.PORT || 5000
const app = express()
const rota = require('./src/routes')

app.use(cors())
app.use(express.json())
app.use(rota)

app.listen(port, () => {
    console.log(`Server respondendo em http://localhost:${port}`)
})