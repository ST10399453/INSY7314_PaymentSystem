import {MongoClient} from "mongodb"
import dotenv from "dotenv"
dotenv.config()

const connString  = process.env.MONGO_URI   
const client = new MongoClient(connString)

async function connect(){
    try{
        await client.connect()
        console.log("Mongo connected Successfully")
    }catch(err){
        console.error(err)
    }
}
export {connect, client}