import express from "express"
import { addProduct , getProducts, updateProduct, deleteProduct, getProduct, getVariantByKey, deleteVariantByKey, updateVariantByKey} from "../controllers/productController.js"

const productRouter = express.Router()

productRouter.post("/add", addProduct)
productRouter.get("/get", getProducts)
productRouter.get("/getOne/:key", getProduct)
productRouter.put("/update/:key", updateProduct)
productRouter.delete("/delete/:key", deleteProduct)
productRouter.delete("/:key/variant/:vKey", deleteVariantByKey)
productRouter.get("/:key/variant/:vKey", getVariantByKey)
productRouter.put("/:key/variant/:vKey", updateVariantByKey)


export default productRouter