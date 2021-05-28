const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = require('graphql')

const authors = [
    { id: 1, name: 'first author'},
    { id: 2, name: 'second author'},
    { id: 3, name: 'third author'}
]

const books = [
    {id: 1, name: 'book 1', authorId: 1 },
    {id: 2, name: 'book 2', authorId: 1 },
    {id: 3, name: 'book 3', authorId: 2 },
    {id: 4, name: 'book 4', authorId: 2 },
    {id: 5, name: 'book 5', authorId: 3 },
    {id: 6, name: 'book 6', authorId: 3 }
]

const app = express()

const BookType = new GraphQLObjectType({
    name: 'Book', 
    description: 'this is a book written by author',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name : {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'Author name and author info',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt)},
        name : { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id )
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'Query',
    description: 'Root query',
    fields: () => ({
        book : {
            type: BookType,
            description: 'Single Book',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: { 
            type: new GraphQLList(BookType),
            description: 'list of books',
            resolve: () => books
        },
        authors: { 
            type: new GraphQLList(AuthorType),
            description: 'list of authors',
            resolve: () => authors
        },
        author: { 
            type: AuthorType,
            description: 'single Author',
            args: {
                id: { type: GraphQLInt},
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        }
    })
})

const RootMutation = new GraphQLObjectType({
    name: 'mutation',
    description: 'Root mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'adding a book',
            args: {
                name : { type: GraphQLNonNull(GraphQLString) },
                authorId : { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length+ 1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'adding a author',
            args: {
                name : { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const author = {
                    id: authors.length+ 1,
                    name: args.name,
                }
                authors.push(author)
                return author
            }
        }
    })
})
const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
})
// const schema = new GraphQLSchema({
//     query: new GraphQLObjectType({
//         name: 'HelloWorld',
//         fields: () => ({
//             message: { 
//                 type: GraphQLString,
//                 resolve: () => 'Hello World'
//             },
//             id: {
//                 type: GraphQLInt,
//                 resolve: () => '100'
//             }
//         })
//     })
// })

app.use('/__graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))
app.listen(5000, () => console.log('server is running buddy !!!'))