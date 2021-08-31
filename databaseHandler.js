const { constants } = require('buffer');
const { Console } = require('console');
const {ObjectId,MongoClient} = require('mongodb');
const { CLIENT_RENEG_LIMIT } = require('tls');
const url = 'mongodb+srv://TrungHieu:Hiokyo230596@asm2.wknny.mongodb.net/Asm2?retryWrites=true&w=majority';
const DATABASE_NAME = "ATNdb"

async function getDB() {
    const client = await MongoClient.connect(url);
    const dbo = client.db(DATABASE_NAME);
    return dbo;
}

//return "-1": invalid; admin or customer
async function getRole(nameInput,pass){
    const dbo = await getDB();
    const s = await dbo.collection("users").findOne({ name: nameInput, pass:pass });
    if(s==null)
        return "-1";
    else
        return s.role;
}

async function insertUser(newUser) {
    const dbo = await getDB();
    await dbo.collection("users").insertOne(newUser);
}

async function insertProduct(newProduct ) {
    const dbo = await getDB();
    await dbo.collection("product").insertOne(newProduct);
}

async function updateProduct(id, nameInput, priceInput) {
    const filter = { _id: ObjectId(id) };
    const newValue = { $set: { name: nameInput, price: priceInput } };

    const dbo = await getDB ();
    await dbo.collection("product").updateOne(filter, newValue);
}
async function getProductById(id) {
    const dbo = await getDB();
    const p = await dbo.collection("product").findOne({ _id: ObjectId(id) });
    return p;
}
async function deleteProduct(id) {
    const dbo = await getDB();
    await dbo.collection("product").deleteOne({ "_id": ObjectId(id) });
}
module.exports = {getDB,insertProduct,updateProduct,getProductById,deleteProduct,insertUser,getRole}