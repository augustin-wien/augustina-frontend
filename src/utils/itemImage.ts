// Path of the thumbnail the backend serves for an item image (img/x.png -> img/thumbs/x.png)
export function thumbnailPath(image?: string | null): string {
  if (!image) return ''
  return image.replace(/^img\//, 'img/thumbs/')
}
