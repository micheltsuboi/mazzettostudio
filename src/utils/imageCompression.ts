export async function compressImage(file: File): Promise<File> {
    const maxWidth = 1920
    const maxHeight = 1080
    const quality = 0.85

    return new Promise((resolve, reject) => {
        const image = new Image()
        image.src = URL.createObjectURL(file)

        image.onload = () => {
            let width = image.width
            let height = image.height

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width)
                width = maxWidth
            }

            // Also check height limit if necessary, but width is usually the constraint for web
            if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height)
                height = maxHeight
            }

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            if (!ctx) {
                reject(new Error('Canvas context not available'))
                return
            }

            // Better scaling quality
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'

            ctx.drawImage(image, 0, 0, width, height)

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Compression failed'))
                        return
                    }
                    // Create new file from blob
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    })
                    resolve(compressedFile)
                },
                'image/jpeg',
                quality
            )
        }

        image.onerror = (error) => reject(error)
    })
}
