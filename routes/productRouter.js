import express from "express"
import { addProduct , getProducts, updateProduct, deleteProduct, getProduct, deleteVariant, getVariant} from "../controllers/productController.js"

const productRouter = express.Router()

productRouter.post("/add", addProduct)
productRouter.get("/get", getProducts)
productRouter.get("/getOne/:key", getProduct)
productRouter.put("/update/:key", updateProduct)
productRouter.delete("/delete/:key", deleteProduct)
productRouter.delete("/deleteVariant/:key", deleteVariant)
productRouter.get("/getVariant/:key", getVariant)


export default productRouter