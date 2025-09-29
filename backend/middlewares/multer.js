import multer from "multer";

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./public")
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    cb(null, true)
}

export const upload=multer({storage, fileFilter})