import Product from "../models/product.js"
import { isItAdmin } from "./userController.js"
export async function getProducts(req, res) {

    let isAdmin = isItAdmin(req)
    

    try{

        if(isItAdmin(req)){
            const products = await Product.find()
            res.json(products)
            return
        }else{
            const products = await Product.find({availability: true})
            res.json(products)
            return
        }
    }catch(e){
        res.status(500).json({message: "Failed to get products"})
    }
}