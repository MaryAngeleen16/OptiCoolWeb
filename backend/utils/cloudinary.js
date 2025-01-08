const cloudinary = require('cloudinary')

const uploadSingle = async ({ filePath, request }) => {

    const result = await cloudinary.v2.uploader.upload(filePath, {
        folder: `OptiCool`, // folder name in cloudinary, if not exist it will create automatically.
        // width: 200, 
        // crop: "scale",
    });

    return {
        public_id: result.public_id,
        url: result.secure_url,
    }
}

const uploadMultiple = async ({ imageFiles, request }) => {

    let images = []
    for (let i = 0; i < imageFiles.length; i++) {

        let image = imageFiles[i].path;

        const result = await cloudinary.v2.uploader.upload(image, {
            folder: `tupt-online-platform`, // folder name in cloudinary, if not exist it will create automatically.
            // width: 200, 
            // crop: "scale",
        });
        console.log(imageFiles[i].originalname)
        images.push({
            public_id: result.public_id,
            url: result.secure_url,
            original_name: imageFiles[i].originalname
        })
    }

    return images
}

module.exports = {
    uploadMultiple,
    uploadSingle
}