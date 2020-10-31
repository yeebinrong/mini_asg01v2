// load libraries
const express = require('express')
const handlebars = require('express-handlebars')
const fetch = require('node-fetch')
const withQuery = require('with-query').default

// create instance of express
const app = express()

// configure handlebars
app.engine('hbs',
    handlebars({
        defaultLayout: 'template.hbs'
    })
)
app.set('view engine', 'hbs')

// declare variables
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000
const images = ['cn', 'fr', 'jp', 'sg', 'uk', 'us']
const category = ['Business', 'Entertainment', 'General', 'Health', 'Science', 'Sports', 'Technology']
const ENDPOINT = 'https://newsapi.org/v2/top-headlines'
const API_KEY = process.env.NEWSAPI
const cache = []

//load libraries
app.use(express.static(`${__dirname}/static`))

// # GET # routes
app.get('/', (req, resp) => {
    resp.status(200)
    resp.type('text/html')
    resp.render('home',
        {
            title: 'Search news',
            images,
            category,
            searching: 0 // not searching
        }
    )
})

app.get('/search', async (req, resp) => {
    const search = req.query.search
    const country = (req.query.images).toUpperCase()
    const cat = req.query.category

            // title
            // description
            // urlToImage
            // publishedAt 
            // url

    try {
        const results = await getNews(cat, country, search)
        const articles = results.articles

        for (article of articles)
        {
            article['default'] = req.query['country']
            article['publishedAt'] = new Date (article.publishedAt)
        }

        resp.status(200)
        resp.type('text/html')
        resp.render('home',
            {
                title: 'Search results',
                images,
                category,
                searching: 1, // searching
                cat,
                search,
                country,
                articles
            }
        )
    } catch (e) {
        console.error('Error detected: ', e)
    }
})

// # redirect
app.use((req, resp) => {
    resp.redirect('/')
})

// ## FUNCTIONS ##
const getNews = async (category, country, search) => {
    const URL = withQuery(
        ENDPOINT,
        {
            q: search,
            //apiKey: API_KEY, // use x-api key instead of this for security
            country: country,
            category
        }
    )

    if (cache[URL])
    {
        console.info(`cache retrieved at ${new Date()}`)
        return cache[URL]
    }
    else
    {
        try {
            const results = await fetch(URL, {
                method: 'GET',
                headers: {
                    'X-API-KEY': API_KEY,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })
            
            if (results.status == 200)
            {
                const dataArray = results.json()
                cache[URL] = dataArray
                return Promise.resolve(dataArray)
            }
            else
            {
                return Promise.reject(results.statusText)
            }
        } catch (e) {
            console.error('Error detected: ', e)
            return Promise.reject(e)
        }
    }
}

// listen port
app.listen(PORT , () => {
    console.info(`Application is listening on PORT ${PORT} at ${new Date()}.`)
})