import express from "express"
import { addProduct , getProducts, updateProduct, deleteProduct, getProduct, deleteVariant, getVariant} from "../controllers/productController.js"

const productRouter = express.Router()

productRouter.post("/", addProduct)
productRouter.get("/", getProducts)
productRouter.get("/:key", getProduct)
productRouter.put("/:key", updateProduct)
productRouter.delete("/:key", deleteProduct)
productRouter.delete("/:key/variant", deleteVariant)
productRouter.get("/:key/variant", getVariant)


export default productRouter